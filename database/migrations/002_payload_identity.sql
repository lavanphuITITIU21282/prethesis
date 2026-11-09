-- Missing JSON keys produce NULL, which alone does not fail a CHECK constraint.
ALTER TABLE content.chapters ADD CONSTRAINT payload_identity_matches CHECK (payload @> jsonb_build_object('id', id));
ALTER TABLE content.lessons ADD CONSTRAINT payload_identity_matches CHECK (payload @> jsonb_build_object('id', id));
ALTER TABLE content.concepts ADD CONSTRAINT payload_identity_matches CHECK (payload @> jsonb_build_object('id', id));
ALTER TABLE content.commands ADD CONSTRAINT payload_identity_matches CHECK (payload @> jsonb_build_object('id', id));
ALTER TABLE content.questions ADD CONSTRAINT payload_identity_matches CHECK (payload @> jsonb_build_object('id', id));
