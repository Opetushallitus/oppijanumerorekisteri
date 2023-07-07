ALTER TABLE henkilo ADD COLUMN vtj_bucket bigint default null;

ALTER TABLE henkilo_aud ADD COLUMN vtj_bucket bigint default null;

CREATE INDEX IF NOT EXISTS henkilo_vtj_bucket_idx ON henkilo USING btree (vtj_bucket);