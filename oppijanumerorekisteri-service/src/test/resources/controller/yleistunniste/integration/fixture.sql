DELETE FROM henkilo;
DELETE FROM henkiloviite;

INSERT INTO henkilo(id, version, etunimet, kutsumanimi, sukunimi, oidhenkilo, created, modified, duplicate, eisuomalaistahetua, passivoitu, turvakielto, yksilointi_yritetty, yksiloity, yksiloityvtj) VALUES
(1, 1, 'master', 'master', 'master', 'master', {ts '2022-11-14 10:00:00.00'}, {ts '2022-11-14 10:00:00.00'}, false, false, false, false, false, true, false),
(2, 1, 'duplicate1', 'duplicate1', 'duplicate1', 'duplicate1', {ts '2022-11-14 11:00:00.00'}, {ts '2022-11-14 11:00:00.00'}, true, false, true, false, false, false, false),
(3, 1, 'duplicate2', 'duplicate2', 'duplicate2', 'duplicate2', {ts '2022-11-14 11:00:00.00'}, {ts '2022-11-14 11:00:00.00'}, true, false, true, false, false, false, false),
(4, 1, 'yksiloimaton', 'yksiloimaton', 'yksiloimaton', 'yksiloimaton', {ts '2022-11-14 11:00:00.00'}, {ts '2022-11-14 11:00:00.00'}, false, false, false, false, false, false, false),
(5, 1, 'yksiloity', 'yksiloity', 'yksiloity', 'yksiloity', {ts '2022-11-14 11:00:00.00'}, {ts '2022-11-14 11:00:00.00'}, false, false, false, false, false, true, false);

INSERT INTO henkiloviite(id, version, master_oid, slave_oid) VALUES
(1, 1, 'master', 'duplicate1'),
(2, 1, 'master', 'duplicate2')
