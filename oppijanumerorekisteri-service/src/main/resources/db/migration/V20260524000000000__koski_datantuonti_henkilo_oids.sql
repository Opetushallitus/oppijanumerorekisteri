CREATE SCHEMA IF NOT EXISTS import;

CREATE TABLE IF NOT EXISTS import.koski_datantuonti_henkilo_oids (
    oid text,
    processed timestamptz
);

CREATE INDEX IF NOT EXISTS koski_datantuonti_henkilo_oids_unprocessed_idx
    ON import.koski_datantuonti_henkilo_oids (oid)
    WHERE processed IS NULL;
