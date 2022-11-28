INSERT INTO kielisyys (id, version, kielikoodi, kielityyppi) VALUES (1, 0, 'fi', 'suomi');


-- PETTERI
INSERT INTO henkilo (id, version, etunimet, hetu, kotikunta, kutsumanimi, oidhenkilo, sukunimi, sukupuoli, turvakielto, eisuomalaistahetua, asiointikieli_id, passivoitu, yksiloity, syntymaaika, duplicate, aidinkieli_id, yksilointi_yritetty, created, modified, kasittelija, yksiloityvtj, vtjsync_timestamp, kuolinpaiva, vtj_register, kuolinsiivous)
VALUES (160268845, 5, 'Niko-Petteri Testi', '260626-9554', 493, 'Niko-Petteri', '1.2.246.562.24.14857097582', 'Parkkila-Testi', '1', false, false, null, false, false, '1945-03-11', false, 1, true, '2019-05-22 04:30:22.207000', '2020-03-13 02:15:00.126383', '1.2.246.562.24.66631583590', true, '2019-05-22 02:59:50.148000 +00:00', null, true, null);

INSERT INTO yhteystiedotryhma (id, version, ryhmakuvaus, henkilo_id, ryhma_alkuperatieto, read_only, yksilointitieto_id)
VALUES (358376, 0, 'yhteystietotyyppi1', 160268845, 'alkupera1', false, null);
INSERT INTO yhteystiedot (id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id) VALUES (68785666, 0, 'YHTEYSTIETO_KUNTA', 'FOO', 358376);
INSERT INTO yhteystiedotryhma (id, version, ryhmakuvaus, henkilo_id, ryhma_alkuperatieto, read_only, yksilointitieto_id)
VALUES (358377, 0, 'yhteystietotyyppi1', 160268845, 'alkupera2', false, null);
INSERT INTO yhteystiedot (id, version, yhteystieto_tyyppi, yhteystieto_arvo, yhteystiedotryhma_id) VALUES (68785667, 0, 'YHTEYSTIETO_KATUOSOITE', 'BAR', 358377);
