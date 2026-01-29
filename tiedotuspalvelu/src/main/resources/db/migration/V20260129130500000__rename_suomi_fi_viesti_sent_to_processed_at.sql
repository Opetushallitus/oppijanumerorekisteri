ALTER TABLE tiedote
    DROP COLUMN suomi_fi_viesti_sent;
ALTER TABLE tiedote
    ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE
