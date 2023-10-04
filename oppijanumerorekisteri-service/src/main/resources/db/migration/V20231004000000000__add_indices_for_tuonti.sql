CREATE INDEX IF NOT EXISTS tuonti_aikaleima_idx ON tuonti USING btree (aikaleima);
CREATE INDEX IF NOT EXISTS tuonti_kasittelija_idx ON tuonti USING btree (kasittelija_oid);