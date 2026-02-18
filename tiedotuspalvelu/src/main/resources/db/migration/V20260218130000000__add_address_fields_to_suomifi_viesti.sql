ALTER TABLE suomifi_viesti
    ADD COLUMN name           TEXT NOT NULL,
    ADD COLUMN street_address TEXT NOT NULL,
    ADD COLUMN zip_code       TEXT NOT NULL,
    ADD COLUMN city           TEXT NOT NULL,
    ADD COLUMN country_code   TEXT NOT NULL;
