INSERT INTO henkilo (id, version, hetu, oidhenkilo, created, modified, duplicate, eisuomalaistahetua, passivoitu, yksilointi_yritetty, yksiloity, yksiloityvtj, etunimet, kutsumanimi, sukunimi) VALUES
(-1, 0, '111111-1235', 'SomeOtherVirkailija', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-2, 0, '010101-123N', 'EverythingOK', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-3, 0, '010101-123M', 'Tyoosoite', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-4, 0, '010101-123L', 'TyoosoiteVainLuku', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-5, 0, '010101-123K', 'Kotiosoite', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-6, 0, '010101-234R', 'EverythingOkOppija', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-7, 0, NULL, 'NoHetu', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja');

INSERT INTO yhteystiedotryhma (id, version, henkilo_id, ryhmakuvaus, read_only, ryhma_alkuperatieto) VALUES
(-1, 0, (SELECT id FROM henkilo where oidhenkilo = 'Tyoosoite'), 'yhteystietotyyppi2', FALSE, 'alkupera6');
INSERT INTO yhteystiedot (id, version, yhteystiedotryhma_id, yhteystieto_tyyppi, yhteystieto_arvo) VALUES
(-1, 0, (SELECT MIN(id) FROM yhteystiedotryhma), 'YHTEYSTIETO_SAHKOPOSTI', 'tyoosoite@example.com');

INSERT INTO yhteystiedotryhma (id, version, henkilo_id, ryhmakuvaus, read_only, ryhma_alkuperatieto) VALUES
(-2, 0, (SELECT id FROM henkilo where oidhenkilo = 'TyoosoiteVainLuku'), 'yhteystietotyyppi2', TRUE, 'alkupera6');
INSERT INTO yhteystiedot (id, version, yhteystiedotryhma_id, yhteystieto_tyyppi, yhteystieto_arvo) VALUES
(-2, 0, (SELECT MIN(id) FROM yhteystiedotryhma), 'YHTEYSTIETO_SAHKOPOSTI', 'tyoosoite@example.com');

INSERT INTO yhteystiedotryhma (id, version, henkilo_id, ryhmakuvaus, read_only, ryhma_alkuperatieto) VALUES
(-3, 0, (SELECT id FROM henkilo where oidhenkilo = 'Kotiosoite'), 'yhteystietotyyppi1', FALSE, 'alkupera6');
INSERT INTO yhteystiedot (id, version, yhteystiedotryhma_id, yhteystieto_tyyppi, yhteystieto_arvo) VALUES
(-3, 0, (SELECT MIN(id) FROM yhteystiedotryhma), 'YHTEYSTIETO_SAHKOPOSTI', 'kotiosoite@example.com');
