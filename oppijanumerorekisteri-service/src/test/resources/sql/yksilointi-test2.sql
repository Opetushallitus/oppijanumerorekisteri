INSERT INTO henkilo (version, hetu, oidhenkilo, created, modified, henkilotyyppi, duplicate, eisuomalaistahetua, ei_yksiloida, passivoitu, yksilointi_yritetty, yksiloity, yksiloityvtj, etunimet, kutsumanimi, sukunimi) VALUES
(0, '111111-1235', 'SomeOtherVirkailija', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, '010101-123N', 'EverythingOK', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, '010101-123M', 'Tyoosoite', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, '010101-123L', 'TyoosoiteVainLuku', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, '010101-123K', 'Kotiosoite', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, '010101-234R', 'EverythingOkOppija', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, NULL, 'NoHetu', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja');

INSERT INTO yhteystiedotryhma (version, henkilo_id, ryhmakuvaus, read_only) VALUES
(0, (SELECT id FROM henkilo where oidhenkilo = 'Tyoosoite'), 'yhteystietotyyppi2', FALSE);
INSERT INTO yhteystiedot (version, yhteystiedotryhma_id, yhteystieto_tyyppi, yhteystieto_arvo) VALUES
(0, (SELECT MAX(id) FROM yhteystiedotryhma), 'YHTEYSTIETO_SAHKOPOSTI', 'tyoosoite@example.com');

INSERT INTO yhteystiedotryhma (version, henkilo_id, ryhmakuvaus, read_only) VALUES
(0, (SELECT id FROM henkilo where oidhenkilo = 'TyoosoiteVainLuku'), 'yhteystietotyyppi2', TRUE);
INSERT INTO yhteystiedot (version, yhteystiedotryhma_id, yhteystieto_tyyppi, yhteystieto_arvo) VALUES
(0, (SELECT MAX(id) FROM yhteystiedotryhma), 'YHTEYSTIETO_SAHKOPOSTI', 'tyoosoite@example.com');

INSERT INTO yhteystiedotryhma (version, henkilo_id, ryhmakuvaus, read_only) VALUES
(0, (SELECT id FROM henkilo where oidhenkilo = 'Kotiosoite'), 'yhteystietotyyppi1', FALSE);
INSERT INTO yhteystiedot (version, yhteystiedotryhma_id, yhteystieto_tyyppi, yhteystieto_arvo) VALUES
(0, (SELECT MAX(id) FROM yhteystiedotryhma), 'YHTEYSTIETO_SAHKOPOSTI', 'kotiosoite@example.com');
