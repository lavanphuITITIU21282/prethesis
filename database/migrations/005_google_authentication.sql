CREATE FUNCTION identity.auth_google_session(p_subject text, p_name text, p_hash text, p_previous text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE account_id uuid;
BEGIN
  IF p_subject IS NULL OR length(p_subject) NOT BETWEEN 1 AND 255 THEN
    RAISE EXCEPTION 'Invalid Google subject' USING ERRCODE='22023';
  END IF;

  -- Serialize first sign-ins for the same Google subject so they share one local account.
  PERFORM pg_advisory_xact_lock(hashtextextended('tram-hoc:google:' || p_subject, 0));
  SELECT user_id INTO account_id FROM identity.external_identities
    WHERE issuer='https://accounts.google.com' AND subject=p_subject;

  IF NOT FOUND THEN
    INSERT INTO identity.users(display_name) VALUES (p_name) RETURNING id INTO account_id;
    INSERT INTO identity.external_identities(issuer, subject, user_id)
      VALUES ('https://accounts.google.com', p_subject, account_id);
  END IF;

  PERFORM identity.auth_start_session(account_id, p_hash, p_previous);
END $$;

REVOKE ALL ON FUNCTION identity.auth_google_session(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.auth_google_session(text,text,text,text) TO tram_hoc_runtime;
