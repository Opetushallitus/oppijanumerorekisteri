INSERT INTO kielisyys (id, version, kielikoodi, kielityyppi) VALUES (1, 0, 'fi', 'suomi');


-- PETTERI
INSERT INTO henkilo (id, version, etunimet, hetu, kotikunta, kutsumanimi, oidhenkilo, sukunimi, sukupuoli, turvakielto, eisuomalaistahetua, asiointikieli_id, passivoitu, yksiloity, syntymaaika, duplicate, aidinkieli_id, yksilointi_yritetty, created, modified, kasittelija, yksiloityvtj, vtjsync_timestamp, kuolinpaiva, vtj_register, kuolinsiivous)
VALUES (1, 5, 'Niko-Petteri Testi', '260626-9554', 493, 'Niko-Petteri', '1.2.246.562.24.14857097582', 'Parkkila-Testi', '1', true, false, null, false, false, '1945-03-11', false, 1, true, '2019-05-22 04:30:22.207000', '2020-03-13 02:15:00.126383', '1.2.246.562.24.66631583590', true, '2019-05-22 02:59:50.148000 +00:00', null, true, null);

INSERT INTO yhteystiedotryhma (id, version, ryhmakuvaus, henkilo_id, ryhma_alkuperatieto, read_only, yksilointitieto_id)
VALUES (2, 0, 'yhteystietotyyppi1', 1, 'alkupera1', false, null);
INSERT INTO yhteystiedot (id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id) VALUES (1, 0, 'YHTEYSTIETO_KUNTA', 'FOO', 2);
INSERT INTO yhteystiedotryhma (id, version, ryhmakuvaus, henkilo_id, ryhma_alkuperatieto, read_only, yksilointitieto_id)
VALUES (3, 0, 'yhteystietotyyppi1', 1, 'alkupera2', false, null);
INSERT INTO yhteystiedot (id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id) VALUES (2, 0, 'YHTEYSTIETO_KATUOSOITE', 'BAR', 3);

-- ERIC
INSERT INTO henkilo (id, version, etunimet, hetu, kotikunta, kutsumanimi, oidhenkilo, sukunimi, sukupuoli, turvakielto, eisuomalaistahetua, asiointikieli_id, passivoitu, yksiloity, syntymaaika, duplicate, aidinkieli_id, yksilointi_yritetty, created, modified, kasittelija, yksiloityvtj, vtjsync_timestamp, kuolinpaiva, vtj_register, kuolinsiivous)
VALUES (4, 5, 'Eric Testi', '150380-919C', 999, 'Eric', '1.2.246.562.24.44982307832', 'Korpinen-Testi', '2', false, false, null, false, false, '1980-03-15', false, 1, true, '2018-11-21 02:33:40.769000', '2020-03-13 02:15:00.126383', '1.2.246.562.24.66631583590', true, null, null, true, null);

INSERT INTO yhteystiedotryhma (id, version, ryhmakuvaus, henkilo_id, ryhma_alkuperatieto, read_only, yksilointitieto_id)
VALUES (5, 0, 'yhteystietotyyppi1', 4, 'alkupera1', false, null);
INSERT INTO yhteystiedot (id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id) VALUES (3, 0, 'YHTEYSTIETO_KUNTA', 'FOO', 5);
INSERT INTO yhteystiedotryhma (id, version, ryhmakuvaus, henkilo_id, ryhma_alkuperatieto, read_only, yksilointitieto_id)
VALUES (6, 0, 'yhteystietotyyppi1', 4, 'alkupera2', false, null);
INSERT INTO yhteystiedot (id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id) VALUES (4, 0, 'YHTEYSTIETO_KATUOSOITE', 'BAR', 6);
