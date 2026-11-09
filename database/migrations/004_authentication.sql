CREATE TABLE identity.password_credentials (
  user_id uuid PRIMARY KEY REFERENCES identity.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_]{3,32}$'),
  password_hash text NOT NULL CHECK (password_hash ~ '^scrypt1\$[a-f0-9]{32}\$[a-f0-9]{128}$')
);
CREATE TABLE identity.sessions (
  token_hash text PRIMARY KEY CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL CHECK (expires_at > created_at)
);
CREATE INDEX sessions_user ON identity.sessions(user_id);
CREATE INDEX sessions_expiry ON identity.sessions(expires_at);
CREATE TABLE identity.auth_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL CHECK (hits > 0),
  expires_at timestamptz NOT NULL
);
CREATE INDEX auth_limits_expiry ON identity.auth_limits(expires_at);
ALTER TABLE identity.password_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.password_credentials FORCE ROW LEVEL SECURITY;
ALTER TABLE identity.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE identity.auth_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.auth_limits FORCE ROW LEVEL SECURITY;

-- These narrow entry points run under the migration owner, not the application login.
-- Qualified names and a fixed search_path prevent object substitution in definer functions.
CREATE FUNCTION identity.auth_register(p_username text, p_name text, p_hash text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE result uuid;
BEGIN
  INSERT INTO identity.users(display_name) VALUES (p_name) RETURNING id INTO result;
  INSERT INTO identity.password_credentials(user_id,username,password_hash) VALUES (result,p_username,p_hash);
  RETURN result;
END $$;
CREATE FUNCTION identity.auth_credentials(p_username text)
RETURNS TABLE(user_id uuid, password_hash text) LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT c.user_id,c.password_hash FROM identity.password_credentials c
  JOIN identity.users u ON u.id=c.user_id WHERE c.username=p_username AND u.disabled_at IS NULL;
$$;
CREATE FUNCTION identity.auth_session(p_hash text)
RETURNS TABLE(user_id uuid, display_name text) LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT u.id,u.display_name FROM identity.sessions s JOIN identity.users u ON u.id=s.user_id
  WHERE s.token_hash=p_hash AND s.expires_at>now() AND u.disabled_at IS NULL;
$$;
CREATE FUNCTION identity.auth_start_session(p_user uuid, p_hash text, p_previous text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  PERFORM 1 FROM identity.users WHERE id=p_user AND disabled_at IS NULL FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Account unavailable' USING ERRCODE='28000'; END IF;
  DELETE FROM identity.sessions WHERE token_hash=p_previous OR expires_at<=now();
  INSERT INTO identity.sessions(token_hash,user_id,expires_at) VALUES (p_hash,p_user,now()+interval '7 days');
END $$;
CREATE FUNCTION identity.auth_end_session(p_hash text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  DELETE FROM identity.sessions WHERE token_hash=p_hash;
$$;
CREATE FUNCTION identity.auth_throttle(p_key text, p_seconds integer, p_max integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE total integer;
BEGIN
  IF length(p_key)>100 OR p_seconds NOT BETWEEN 1 AND 3600 OR p_max NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'Invalid throttle';
  END IF;
  DELETE FROM identity.auth_limits WHERE expires_at<=now();
  INSERT INTO identity.auth_limits AS limits(key,hits,expires_at)
    VALUES (p_key,1,now()+make_interval(secs=>p_seconds))
    ON CONFLICT (key) DO UPDATE SET hits=limits.hits+1 RETURNING hits INTO total;
  RETURN total<=p_max;
END $$;
REVOKE ALL ON FUNCTION identity.auth_register(text,text,text), identity.auth_credentials(text), identity.auth_session(text), identity.auth_start_session(uuid,text,text), identity.auth_end_session(text), identity.auth_throttle(text,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.auth_register(text,text,text), identity.auth_credentials(text), identity.auth_session(text), identity.auth_start_session(uuid,text,text), identity.auth_end_session(text), identity.auth_throttle(text,integer,integer) TO tram_hoc_runtime;
