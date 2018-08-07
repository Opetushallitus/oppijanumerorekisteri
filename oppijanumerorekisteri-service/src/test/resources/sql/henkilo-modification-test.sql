INSERT INTO henkilo (id, version, hetu, oidhenkilo, created, modified, duplicate, eisuomalaistahetua, passivoitu, yksilointi_yritetty, yksiloity, yksiloityvtj, etunimet, kutsumanimi, sukunimi) VALUES
(-1, 0, '111111-985K', 'VTJYKSILOITY1', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-2, 0, '111111-1234', 'VTJYKSILOITY2', NOW(), NOW(), FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Teppo Taneli', 'Teppo', 'Testaaja'),
(-3, 0, '170798-9330', 'YKSILOINNISSAVIRHE', NOW(), NOW(), FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Teppo Taneli', 'Teppo', 'Testaaja')
;

INSERT INTO yksilointivirhe (id, version, aikaleima, poikkeus, henkilo_id) VALUES
(-1, 0, NOW(), 'fi.vm.sade.oppijanumerorekisteri.exceptions.SuspendableIdentificationException', -3)
;
