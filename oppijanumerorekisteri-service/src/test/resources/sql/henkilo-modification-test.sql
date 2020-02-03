INSERT INTO henkilo (id, version, hetu, oidhenkilo, created, modified, duplicate, eisuomalaistahetua, turvakielto, passivoitu, yksilointi_yritetty, yksiloity, yksiloityvtj, etunimet, kutsumanimi, sukunimi) VALUES
(-1, 0, '111111-985K', 'VTJYKSILOITY1', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-2, 0, '111111-1234', 'VTJYKSILOITY2', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-3, 0, '170798-9330', 'YKSILOINNISSAVIRHE', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-4, 0, '170798-915D', 'YKSILOINNISSANIMIPIELESSA', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-5, 0, '111298-917M', 'HUOLTAJA', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Hana Hii', 'Hana', 'Huoltaja')
;

INSERT INTO henkilo_hetu (henkilo_id, hetu)
SELECT id, hetu FROM henkilo WHERE yksiloityvtj = TRUE;

INSERT INTO henkilo_hetu (henkilo_id, hetu) VALUES
(-2, '111111-1233')
;

INSERT INTO yksilointivirhe (id, version, aikaleima, poikkeus, henkilo_id) VALUES
(-1, 0, NOW(), 'fi.vm.sade.oppijanumerorekisteri.exceptions.SuspendableIdentificationException', -3)
;

INSERT INTO yksilointitieto (id, version, henkiloid, turvakielto) VALUES
(-1, 0, -4, FALSE);

INSERT INTO henkilo_huoltaja_suhde (id, version, lapsi_id, huoltaja_id) VALUES
(-1, 0, -4, -5)
;

INSERT INTO yhteystiedotryhma (id, version, ryhmakuvaus, henkilo_id, ryhma_alkuperatieto, read_only, yksilointitieto_id) VALUES
(-1, 0, 'kuvaus', -5, 'alkuperatieto', TRUE, NULL)
;

INSERT INTO yhteystiedot (id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id) VALUES
(-1, 0, 'YHTEYSTIETO_SAHKOPOSTI', 'X', -1)
;

INSERT INTO kansalaisuus (id, version, kansalaisuuskoodi) VALUES
(-1, 0, '246')
;

INSERT INTO henkilo_kansalaisuus (henkilo_id, kansalaisuus_id) VALUES
(-5, -1)
;

