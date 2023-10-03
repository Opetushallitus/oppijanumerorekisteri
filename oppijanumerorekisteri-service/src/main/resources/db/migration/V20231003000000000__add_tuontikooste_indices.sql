CREATE INDEX IF NOT EXISTS tuontikooste_id_idx ON tuontikooste USING btree (id);
CREATE INDEX IF NOT EXISTS tuontikooste_timestamp_idx ON tuontikooste USING btree (timestamp);
CREATE INDEX IF NOT EXISTS tuontikooste_org_idx ON tuontikooste USING btree (org);
CREATE INDEX IF NOT EXISTS tuontikooste_author_idx ON tuontikooste USING btree (author);