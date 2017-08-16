INSERT INTO henkilo (version, hetu, oidhenkilo, created, modified, henkilotyyppi, duplicate, eisuomalaistahetua, ei_yksiloida, passivoitu, yksilointi_yritetty, yksiloity, yksiloityvtj, etunimet, kutsumanimi, sukunimi) VALUES
(0, '111111-985K', 'FakeSSN', NOW(), NOW(), 'VIRKAILIJA', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, '111111-1234', 'Blacklisted', NOW(), NOW(), 'VIRKAILIJA', FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, '111111-1235', 'NotInVTJ', NOW(), NOW(), 'VIRKAILIJA', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, '010101-123N', 'EverythingOK', NOW(), NOW(), 'VIRKAILIJA', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(0, NULL, 'NoHetu', NOW(), NOW(), 'VIRKAILIJA', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja');
