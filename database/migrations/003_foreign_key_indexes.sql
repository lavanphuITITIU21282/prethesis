-- User-first primary keys do not cover release lookups when enforcing foreign keys.
CREATE INDEX progress_content_release ON learning.user_progress(course_id, content_version);
CREATE INDEX attempts_content_release ON assessment.attempts(course_id, content_version);
