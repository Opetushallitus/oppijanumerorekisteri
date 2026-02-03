ALTER TABLE tiedote
    ADD COLUMN otsikko_fi TEXT NOT NULL,
    ADD COLUMN otsikko_sv TEXT NOT NULL,
    ADD COLUMN otsikko_en TEXT NOT NULL,
    ADD COLUMN viesti_fi TEXT NOT NULL,
    ADD COLUMN viesti_sv TEXT NOT NULL,
    ADD COLUMN viesti_en TEXT NOT NULL;
