CREATE TABLE kjhh_2422_invalid_identification AS
    SELECT * FROM identification
    WHERE identifier NOT IN ('email', 'oppijaToken', 'google', 'eidas')
        OR authtoken IS NOT NULL
        OR email IS NOT NULL
        OR expiration_date IS NOT NULL;

UPDATE identification
    SET identifier = idpentityid, idpentityid = identifier
    WHERE identifier IN ('email', 'oppijaToken', 'google', 'eidas');

DELETE FROM identification
    WHERE idpentityid NOT IN ('email', 'oppijaToken', 'google', 'eidas');

ALTER TABLE identification
    DROP COLUMN IF EXISTS authtoken,
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS auth_token_created,
    DROP COLUMN IF EXISTS expiration_date;

CREATE UNIQUE INDEX unique_identifier_eidas_idx
    ON identification (identifier)
    WHERE idpentityid = 'eidas';