INSERT INTO henkilo(id, version, etunimet, kutsumanimi, oidhenkilo, sukunimi, created, modified, duplicate, eisuomalaistahetua, passivoitu, turvakielto, yksilointi_yritetty, yksiloity, yksiloityvtj) VALUES
(1, 1, 'tuonti1', 'tuonti1', 'tuonti1', 'tuonti1', {ts '2022-11-14 10:00:00.00'}, {ts '2022-11-14 10:00:00.00'}, false, false, false, false, false, false, false),
(2, 1, 'tuonti2', 'tuonti2', 'tuonti2', 'tuonti2', {ts '2022-11-14 11:00:00.00'}, {ts '2022-11-14 11:00:00.00'}, false, false, false, false, false, false, false);

INSERT INTO tuonti(id, version, kasiteltavia, kasiteltyja, kasittelija_oid, aikaleima) VALUES
(1, 1, 1, 1, 'tuonti1', {ts '2022-11-14 10:00:00.00'}),
(2, 1, 1, 1, '', {ts '2022-11-14 11:00:00.00'}), -- service user cannot be resolved
(3, 1, 1, 0, '', {ts '2022-11-14 10:30:00.00'}); -- tuonti_rivi not initialized

INSERT INTO tuonti_rivi(id, version, henkilo_id, tuonti_id) VALUES
(1, 1, 1, 1),
(2, 1, 2, 2);

INSERT INTO organisaatio(id, version, oid) VALUES
(1, 1, 'tuonti1'),
(2, 1, 'tuonti2'),
(3, 1, 'tuonti3');

INSERT INTO tuonti_organisaatio(tuonti_id, organisaatio_id) VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO henkilo_organisaatio(henkilo_id, organisaatio_id) VALUES
(1, 1),
(2, 2);
