CREATE TABLE tiedotetype (
    tiedotetype_id TEXT NOT NULL PRIMARY KEY,
    description TEXT NOT NULL
);
INSERT INTO tiedotetype (tiedotetype_id, description) VALUES
('KIELITUTKINTOTODISTUS', 'Kielitutkintotodistuksen tiedote');

CREATE TABLE tiedotestate (
    tiedotestate_id TEXT NOT NULL PRIMARY KEY,
    description TEXT NOT NULL
);
INSERT INTO tiedotestate (tiedotestate_id, description) VALUES
('NEW', 'Tiedotetta ei ole vielä käsitelty'),
('SUOMIFI_VIESTI_HETULLISELLE', 'Tiedotetta välitetään Suomi.fi-viestinä'),
('PAPERIPOSTI_HETULLISELLE', 'Tiedotetta välitetään paperipostina'),
('PAPERIPOSTI_HETUTOMALLE', 'Tiedotetta välitetään paperipostina'),
('PROCESSED', 'Tiedote on käsitelty');

ALTER TABLE tiedote ADD COLUMN tiedotetype_id TEXT NOT NULL
    DEFAULT 'KIELITUTKINTOTODISTUS'
    REFERENCES tiedotetype(tiedotetype_id);
ALTER TABLE tiedote ALTER COLUMN tiedotetype_id DROP DEFAULT;

ALTER TABLE tiedote ADD COLUMN tiedotestate_id TEXT NOT NULL
    DEFAULT 'NEW'
    REFERENCES tiedotestate(tiedotestate_id);
ALTER TABLE tiedote ALTER COLUMN tiedotestate_id DROP DEFAULT;
