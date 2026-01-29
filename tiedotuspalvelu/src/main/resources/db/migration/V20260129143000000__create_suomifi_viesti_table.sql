CREATE TABLE suomifi_viesti
(
    id            UUID PRIMARY KEY,
    tiedote_id    UUID                     NOT NULL REFERENCES tiedote (id) ON DELETE CASCADE,
    henkilotunnus TEXT                     NOT NULL,
    processed_at  TIMESTAMP WITH TIME ZONE,
    next_retry    TIMESTAMP WITH TIME ZONE,
    retry_count   INT                      NOT NULL DEFAULT 0,
    created       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suomifi_viesti_tiedote_id ON suomifi_viesti (tiedote_id);
CREATE INDEX idx_suomifi_viesti_unprocessed ON suomifi_viesti (processed_at) WHERE processed_at IS NULL;

CREATE TRIGGER update_suomifi_viesti_updated
    BEFORE UPDATE
    ON suomifi_viesti
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_column();
