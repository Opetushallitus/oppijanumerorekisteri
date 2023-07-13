CREATE OR REPLACE FUNCTION fix_vtj_update_by_linking_henkilos(
    original_oid text,
    duplicate_oid text
) RETURNS void AS $$
DECLARE
    current_hetu text;
BEGIN
    -- Store the new hetu from duplicate
    SELECT hetu INTO current_hetu FROM henkilo WHERE oidhenkilo = duplicate_oid;

    -- Remove VTJ ykislöinti from duplicate henkilo and mark it as duplicate
    UPDATE henkilo
    SET hetu = NULL,
        yksiloityvtj = false,
        vtj_register = false,
        duplicate = true,
        modified = current_timestamp
    WHERE oidhenkilo = duplicate_oid;

    -- Move hetu history from duplicate to original
    UPDATE henkilo_hetu
    SET henkilo_id = (SELECT id FROM henkilo WHERE oidhenkilo = original_oid)
    WHERE henkilo_id = (SELECT id FROM henkilo WHERE oidhenkilo = duplicate_oid);

    -- Update current hetu for original henkilo
    UPDATE henkilo
    SET hetu = current_hetu,
        modified = current_timestamp
    WHERE oidhenkilo = original_oid;

    -- Link the henkilos
    INSERT INTO henkiloviite (version, master_oid, slave_oid, id)
    VALUES (0, original_oid, duplicate_oid, nextval('hibernate_sequence'));
END;
$$ LANGUAGE plpgsql;
