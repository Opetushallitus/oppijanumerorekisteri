INSERT INTO henkilo (id, version, hetu, oidhenkilo, created, modified, duplicate, eisuomalaistahetua, ei_yksiloida, passivoitu, yksilointi_yritetty, yksiloity, yksiloityvtj, etunimet, kutsumanimi, sukunimi) VALUES
(1, 0, '111111-985K', 'FakeSSN', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(2, 0, '111111-1234', 'Blacklisted', NOW(), NOW(), FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(3, 0, '111111-1235', 'NotInVTJ', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(4, 0, '010101-123N', 'EverythingOK', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja');
