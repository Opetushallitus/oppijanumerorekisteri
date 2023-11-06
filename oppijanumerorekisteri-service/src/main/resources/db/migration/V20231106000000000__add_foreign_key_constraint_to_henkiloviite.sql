CREATE TABLE henkiloviite_deleted_because_invalid_henkilo_oid AS
SELECT * FROM henkiloviite
WHERE NOT EXISTS (SELECT 1 FROM henkilo WHERE oidhenkilo = master_oid)
OR NOT EXISTS (SELECT 1 FROM henkilo WHERE oidhenkilo = slave_oid);

DELETE FROM henkiloviite
WHERE NOT EXISTS (SELECT 1 FROM henkilo WHERE oidhenkilo = master_oid)
OR NOT EXISTS (SELECT 1 FROM henkilo WHERE oidhenkilo = slave_oid);

ALTER TABLE henkiloviite ADD FOREIGN KEY (master_oid) REFERENCES henkilo (oidhenkilo);
ALTER TABLE henkiloviite ADD FOREIGN KEY (slave_oid) REFERENCES henkilo (oidhenkilo);