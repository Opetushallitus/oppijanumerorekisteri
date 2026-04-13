CREATE INDEX idx_tiedote_processing
    ON tiedote (tiedotestate_id, COALESCE(next_retry, created));
