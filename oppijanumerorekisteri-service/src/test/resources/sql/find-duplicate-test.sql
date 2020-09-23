DELETE FROM henkilo;
DROP ALIAS IF EXISTS SIMILARITY;

CREATE ALIAS SIMILARITY FOR "fi.vm.sade.oppijanumerorekisteri.repositories.impl.FakeSimilarityFunction.similarity";
INSERT INTO henkilo (
 id,
 version,
 hetu,
 syntymaaika,
 oidhenkilo,
 etunimet,
 kutsumanimi,
 sukunimi,
 created,
 modified,
 duplicate,
 eisuomalaistahetua,
 turvakielto,
 passivoitu,
 yksilointi_yritetty,
 yksiloity,
 yksiloityvtj
) VALUES (
 1,
 1,
 '111111-1111',
 '1911-11-11',
 '1.23.456.7890111213',
 'Eino Ilmari Urho Kaleva',
 'Eino',
 'Testiäinen',
 now(),
 now(),
 FALSE,
 FALSE,
 FALSE,
 FALSE,
 FALSE,
 FALSE,
 FALSE
), (
 2,
 1,
 null,
 '1911-11-11',
 '1.23.456.7890111214',
 'Eino',
 'Eino',
 'Testiäinen',
 now(),
 now(),
 FALSE,
 FALSE,
 FALSE,
 FALSE,
 FALSE,
 FALSE,
 FALSE
);
