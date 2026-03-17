INSERT INTO tiedotestate (tiedotestate_id, description) VALUES
('OPPIJAN_VALIDOINTI', 'Validoidaan oppijan henkilötiedot ennen tiedotteen lähettämistä'),
('SUOMIFI_VIESTIN_LÄHETYS', 'Tiedotetta välitetään Suomi.fi-viestinä'),
('KIELITUTKINTOTODISTUKSEN_NOUTO', 'Noudetaan kielitutkintotodistusta paperipostia varten'),
('SUOMIFI_VIESTIN_LÄHETYS_PAPERIPOSTIOPTIOLLA', 'Tiedotetta välitetään (ehkä (ja mahdollisesti myös)) paperipostina'),
('TIEDOTE_KÄSITELTY', 'Tiedote on käsitelty')
ON CONFLICT (tiedotestate_id) DO UPDATE SET description = EXCLUDED.description;

UPDATE tiedote SET tiedotestate_id = 'OPPIJAN_VALIDOINTI' WHERE tiedotestate_id = 'NEW';
UPDATE tiedote SET tiedotestate_id = 'SUOMIFI_VIESTIN_LÄHETYS' WHERE tiedotestate_id = 'SUOMIFI_VIESTI_HETULLISELLE';
UPDATE tiedote SET tiedotestate_id = 'KIELITUTKINTOTODISTUKSEN_NOUTO' WHERE tiedotestate_id = 'PAPERIPOSTI_HETULLISELLE';
UPDATE tiedote SET tiedotestate_id = 'TIEDOTE_KÄSITELTY' WHERE tiedotestate_id = 'PROCESSED';

DELETE FROM tiedotestate WHERE tiedotestate_id IN ('NEW', 'SUOMIFI_VIESTI_HETULLISELLE', 'PAPERIPOSTI_HETULLISELLE', 'PAPERIPOSTI_HETUTOMALLE', 'PROCESSED');