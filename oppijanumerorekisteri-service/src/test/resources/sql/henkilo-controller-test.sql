INSERT INTO kansalaisuus (id, version, kansalaisuuskoodi) VALUES
(-1, 0, '246'),
(-2, 0, '504')
;

INSERT INTO kielisyys (id, version, kielikoodi, kielityyppi) VALUES
(-1, 0, 'fi', 'suomi'),
(-2, 0, 'sv', 'svenska')
;

INSERT INTO henkilo (id, version, hetu, syntymaaika, kuolinpaiva, oidhenkilo, created, modified, duplicate, eisuomalaistahetua, turvakielto, passivoitu, yksilointi_yritetty, yksiloity, yksiloityvtj, etunimet, kutsumanimi, sukunimi, aidinkieli_id, asiointikieli_id) VALUES
(-1, 0, '111111-985K', '1911-11-11', NULL, '1.2.3.4.5', NOW() - interval '1 hour', NOW() - interval '1 hour', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja', -1, -1),
(-2, 0, '111111-1234', '1911-11-11', '1996-12-11', '1.2.3.4.6', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo', 'Teppo', 'Testaaja', -2, -2),
(-3, 0, '170798-9330', '1998-07-17', NULL, '1.2.3.4.7', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Taneli', 'Taneli', 'Testaaja', -1, -2),
(-4, 0, '170798-915D', '1998-07-17', NULL, '1.2.3.4.8', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja', -2, -1),
(-5, 0, '111298-917M', '1998-12-11', NULL, '1.2.3.4.9', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Hana Hii', 'Hana', 'Huoltaja', -1, -1)
;

INSERT INTO henkilo_hetu (henkilo_id, hetu)
SELECT id, hetu FROM henkilo WHERE yksiloityvtj = TRUE;

INSERT INTO henkilo_hetu (henkilo_id, hetu) VALUES
(-2, '111111-1233')
;

INSERT INTO yhteystiedotryhma (id, version, ryhmakuvaus, henkilo_id, ryhma_alkuperatieto, read_only, yksilointitieto_id) VALUES
(-1, 0, 'kuvaus', -5, 'alkuperatieto', TRUE, NULL)
;

INSERT INTO yhteystiedot (id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id) VALUES
(-1, 0, 'YHTEYSTIETO_SAHKOPOSTI', 'X', -1)
;

INSERT INTO henkilo_kansalaisuus (henkilo_id, kansalaisuus_id) VALUES
(-1, -1),
(-1, -2),
(-2, -1)
;

INSERT INTO eidastunniste (id, version, henkilo_id, tunniste, createdby) VALUES
(-1, 0, -1, 'FOO/BAR/BAZ', '1.2.3.4.5'),
(-2, 0, -1, 'FOO/BAR/QUUX', '1.2.3.4.6')
;