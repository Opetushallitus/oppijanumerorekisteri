-- Siivotaan puuttuvat alkuperätieto-tietueet
UPDATE yhteystiedotryhma set ryhma_alkuperatieto = 'alkupera6' where ryhma_alkuperatieto is null;

-- Asetetaan not null rajoite alkuperätiedolle
ALTER TABLE yhteystiedotryhma ALTER COLUMN ryhma_alkuperatieto SET NOT NULL;