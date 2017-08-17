INSERT INTO henkilo (version, hetu, oidhenkilo, created, modified, henkilotyyppi, duplicate, eisuomalaistahetua, ei_yksiloida, passivoitu, yksilointi_yritetty, yksiloity, yksiloityvtj, etunimet, kutsumanimi, sukunimi) VALUES
(0, '111111-1235', 'SomeOtherVirkailija', NOW(), NOW(), 'VIRKAILIJA', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, '010101-123N', 'EverythingOK', NOW(), NOW(), 'VIRKAILIJA', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, '010101-234R', 'EverythingOkOppija', NOW(), NOW(), 'OPPIJA', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, NULL, 'NoHetu', NOW(), NOW(), 'VIRKAILIJA', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja');
