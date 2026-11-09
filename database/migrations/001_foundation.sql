-- Content is versioned; private records always carry their owner and course scope.
CREATE SCHEMA identity;
CREATE SCHEMA content;
CREATE SCHEMA learning;
CREATE SCHEMA assessment;
CREATE SCHEMA personalization;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'tram_hoc_runtime') THEN
    CREATE ROLE tram_hoc_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;

CREATE TABLE identity.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK (length(btrim(display_name)) BETWEEN 1 AND 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz
);
CREATE TABLE identity.external_identities (
  issuer text NOT NULL CHECK (length(issuer) BETWEEN 1 AND 500),
  subject text NOT NULL CHECK (length(subject) BETWEEN 1 AND 500),
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  PRIMARY KEY (issuer, subject)
);
CREATE INDEX external_identities_user ON identity.external_identities(user_id);

CREATE TABLE content.courses (
  id text PRIMARY KEY CHECK (length(id) BETWEEN 1 AND 100),
  title text NOT NULL CHECK (length(btrim(title)) > 0)
);
CREATE TABLE content.releases (
  course_id text NOT NULL REFERENCES content.courses(id),
  version integer NOT NULL CHECK (version > 0),
  checksum text NOT NULL CHECK (checksum ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (course_id, version)
);
CREATE TABLE content.chapters (
  course_id text NOT NULL,
  content_version integer NOT NULL,
  id text NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object' AND payload->>'id' = id),
  PRIMARY KEY (course_id, content_version, id),
  FOREIGN KEY (course_id, content_version) REFERENCES content.releases(course_id, version)
);
CREATE TABLE content.lessons (
  course_id text NOT NULL,
  content_version integer NOT NULL,
  id text NOT NULL,
  chapter_id text NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object' AND payload->>'id' = id),
  PRIMARY KEY (course_id, content_version, id),
  FOREIGN KEY (course_id, content_version, chapter_id)
    REFERENCES content.chapters(course_id, content_version, id)
);
CREATE INDEX lessons_chapter ON content.lessons(course_id, content_version, chapter_id);
CREATE TABLE content.sections (
  course_id text NOT NULL,
  content_version integer NOT NULL,
  lesson_id text NOT NULL,
  position integer NOT NULL CHECK (position >= 0),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  PRIMARY KEY (course_id, content_version, lesson_id, position),
  FOREIGN KEY (course_id, content_version, lesson_id)
    REFERENCES content.lessons(course_id, content_version, id)
);
CREATE TABLE content.concepts (
  course_id text NOT NULL,
  content_version integer NOT NULL,
  id text NOT NULL,
  lesson_id text NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object' AND payload->>'id' = id),
  PRIMARY KEY (course_id, content_version, id),
  FOREIGN KEY (course_id, content_version, lesson_id)
    REFERENCES content.lessons(course_id, content_version, id)
);
CREATE INDEX concepts_lesson ON content.concepts(course_id, content_version, lesson_id);
CREATE TABLE content.commands (
  course_id text NOT NULL,
  content_version integer NOT NULL,
  id text NOT NULL,
  lesson_id text NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object' AND payload->>'id' = id),
  PRIMARY KEY (course_id, content_version, id),
  FOREIGN KEY (course_id, content_version, lesson_id)
    REFERENCES content.lessons(course_id, content_version, id)
);
CREATE INDEX commands_lesson ON content.commands(course_id, content_version, lesson_id);
CREATE TABLE content.questions (
  course_id text NOT NULL,
  content_version integer NOT NULL,
  id text NOT NULL,
  lesson_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('recall', 'application', 'syntax', 'boss')),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object' AND payload->>'id' = id),
  PRIMARY KEY (course_id, content_version, id),
  FOREIGN KEY (course_id, content_version, lesson_id)
    REFERENCES content.lessons(course_id, content_version, id)
);
CREATE INDEX questions_lesson_kind ON content.questions(course_id, content_version, lesson_id, kind);

-- The v1 aggregate preserves existing backups without silently losing notes or quiz order.
CREATE TABLE learning.user_progress (
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  content_version integer NOT NULL,
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  state jsonb NOT NULL CHECK (
    jsonb_typeof(state) = 'object' AND state @> '{"version":1}'::jsonb
    AND state ?& ARRAY['notes','read','reviews']
    AND jsonb_typeof(state->'notes') = 'object'
    AND jsonb_typeof(state->'read') = 'object'
    AND jsonb_typeof(state->'reviews') = 'object'
    AND octet_length(state::text) <= 8388608
  ),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id),
  FOREIGN KEY (course_id, content_version) REFERENCES content.releases(course_id, version)
);

CREATE TABLE assessment.attempts (
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id text NOT NULL,
  content_version integer NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  session jsonb NOT NULL CHECK (jsonb_typeof(session) = 'object'),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY (user_id, id),
  UNIQUE (user_id, id, course_id, content_version),
  FOREIGN KEY (course_id, content_version) REFERENCES content.releases(course_id, version),
  CHECK ((status = 'completed') = (completed_at IS NOT NULL)),
  CHECK (completed_at IS NULL OR completed_at >= started_at)
);
CREATE INDEX attempts_user_recent ON assessment.attempts(user_id, course_id, started_at DESC);
CREATE TABLE assessment.grades (
  user_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL,
  course_id text NOT NULL,
  content_version integer NOT NULL,
  question_id text NOT NULL,
  method text NOT NULL CHECK (method IN ('self', 'gemini')),
  score numeric(5,2) NOT NULL CHECK (score BETWEEN 0 AND 10),
  feedback jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(feedback) = 'object'),
  graded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id),
  UNIQUE (user_id, attempt_id, question_id, method),
  FOREIGN KEY (user_id, attempt_id, course_id, content_version)
    REFERENCES assessment.attempts(user_id, id, course_id, content_version) ON DELETE CASCADE,
  FOREIGN KEY (course_id, content_version, question_id)
    REFERENCES content.questions(course_id, content_version, id)
);
CREATE INDEX grades_question ON assessment.grades(course_id, content_version, question_id);
CREATE TABLE personalization.review_schedules (
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  content_version integer NOT NULL,
  concept_id text NOT NULL,
  level integer NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 20),
  seen integer NOT NULL DEFAULT 0 CHECK (seen >= 0),
  correct integer NOT NULL DEFAULT 0 CHECK (correct BETWEEN 0 AND seen),
  due_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id, content_version, concept_id),
  FOREIGN KEY (course_id, content_version, concept_id)
    REFERENCES content.concepts(course_id, content_version, id)
);
CREATE INDEX reviews_user_due ON personalization.review_schedules(user_id, due_at);
CREATE INDEX reviews_concept ON personalization.review_schedules(course_id, content_version, concept_id);

-- The server sets this transaction-local context only after authenticating a session.
DO $$ DECLARE target text; BEGIN
  FOREACH target IN ARRAY ARRAY[
    'identity.users', 'identity.external_identities', 'learning.user_progress',
    'assessment.attempts', 'assessment.grades', 'personalization.review_schedules'
  ] LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', target);
    EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', target);
    EXECUTE format(
      'CREATE POLICY owner_scope ON %s USING (%I = nullif(current_setting(''app.user_id'', true), '''')::uuid) WITH CHECK (%I = nullif(current_setting(''app.user_id'', true), '''')::uuid)',
      target, CASE WHEN target = 'identity.users' THEN 'id' ELSE 'user_id' END,
      CASE WHEN target = 'identity.users' THEN 'id' ELSE 'user_id' END
    );
  END LOOP;
END $$;
GRANT USAGE ON SCHEMA identity, content, learning, assessment, personalization TO tram_hoc_runtime;
GRANT SELECT ON ALL TABLES IN SCHEMA content TO tram_hoc_runtime;
GRANT SELECT ON identity.users TO tram_hoc_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA learning, assessment, personalization TO tram_hoc_runtime;
