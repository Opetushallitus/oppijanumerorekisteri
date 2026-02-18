ALTER TABLE suomifi_viesti
    ADD COLUMN katuosoite  TEXT NOT NULL,
    ADD COLUMN postinumero TEXT NOT NULL,
    ADD COLUMN kaupunki    TEXT NOT NULL;
