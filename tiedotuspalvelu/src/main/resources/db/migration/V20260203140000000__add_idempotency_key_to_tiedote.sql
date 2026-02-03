ALTER TABLE tiedote ADD COLUMN idempotency_key TEXT NOT NULL;
CREATE UNIQUE INDEX idx_tiedote_idempotency_key ON tiedote(idempotency_key);
