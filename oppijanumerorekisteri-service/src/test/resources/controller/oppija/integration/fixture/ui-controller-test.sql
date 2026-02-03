INSERT INTO henkilo(id, version, hetu, etunimet, kutsumanimi, sukunimi, oidhenkilo, syntymaaika, created, modified, duplicate, eisuomalaistahetua, passivoitu, turvakielto, yksilointi_yritetty, yksiloity, yksiloityvtj) VALUES
(1, 1, '120963-969H', 'tuontietu1', 'tuontietu1', 'tuontisuku1', '1.2.3.4.6', {ts '1963-09-12'}, {ts '2022-11-14 10:00:00.00'}, {ts '2022-11-14 10:00:00.00'}, false, false, false, false, true, false, false),
(2, 1, null, 'tuontietu2', 'tuontietu2', 'tuontisuku2', '1.2.3.4.77', {ts '1998-11-14'}, {ts '2022-11-14 11:00:00.00'}, {ts '2022-11-14 11:00:00.00'}, false, false, false, false, false, false, false),
(3, 1, null, 'tuontietu1', 'tuontietu1', 'tuontisuku3', '1.2.3.4.888', {ts '1977-07-07'}, {ts '2022-11-14 10:00:00.00'}, {ts '2022-11-14 10:00:00.00'}, false, false, true, false, true, false, false);

INSERT INTO tuonti_data(id, version, data) VALUES
(1, 1, lo_from_bytea(0, decode('{"sahkoposti":"foo@bar.qux","henkilot":[{"tunniste":"tunniste","henkilo":{"hetu":"240784-9105","etunimet":"Uuno","kutsumanimi":"Yksikkö","sukunimi":"Testaaja","passinumero":null,"sahkoposti":null,"syntymaaika":null,"sukupuoli":null,"aidinkieli":null,"kansalaisuus":[{"koodi":"246"}]}}]}', 'escape')));

INSERT INTO tuonti(id, version, kasiteltavia, kasiteltyja, kasittelija_oid, ilmoitustarve_kasitelty, data_id, aikaleima, api) VALUES
(1, 1, 1, 1, '1.2.3.4.6', true, 1, {ts '2022-11-14 10:00:00.00'}, 'OPPIJA'),
(2, 1, 1, 1, '', true, 1, {ts '2022-11-14 11:00:00.00'}, 'YLEISTUNNISTE'), -- service user cannot be resolved
(3, 1, 1, 0, '', true, 1, {ts '2022-11-14 10:30:00.00'}, null); -- tuonti_rivi not initialized

INSERT INTO tuonti_rivi(id, version, henkilo_id, tuonti_id, tunniste) VALUES
(1, 1, 1, 1, 'tunniste'),
(2, 1, 2, 2, 'tunniste');

INSERT INTO organisaatio(id, version, oid) VALUES
(1, 1, 'tuonti1'),
(2, 1, 'tuonti2'),
(3, 1, 'tuonti3'),
(4, 1,'1.2.246.562.10.00000000001');

INSERT INTO tuonti_organisaatio(tuonti_id, organisaatio_id) VALUES
(1, 1),
(1, 4),
(2, 2),
(2, 4),
(3, 3);

INSERT INTO henkilo_organisaatio(henkilo_id, organisaatio_id) VALUES
(1, 1),
(1, 4),
(2, 2),
(2, 4);                                                                     ;

INSERT INTO henkiloviite(id, version, master_oid, slave_oid) VALUES
(1, 1, '1.2.3.4.6', '1.2.3.4.77');


ALTER SEQUENCE hibernate_sequence RESTART WITH 1000;
