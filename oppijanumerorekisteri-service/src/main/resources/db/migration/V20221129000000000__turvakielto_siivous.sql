UPDATE henkilo SET kotikunta = null
WHERE turvakielto = true AND kotikunta is not null;

DELETE FROM yhteystiedot
WHERE yhteystiedotryhma_id in (SELECT y.id FROM henkilo
                                           JOIN yhteystiedotryhma y ON henkilo.id = y.henkilo_id and y.ryhma_alkuperatieto ='alkupera1'
                                           WHERE henkilo.turvakielto=true);

DELETE FROM yhteystiedotryhma
WHERE ryhma_alkuperatieto ='alkupera1' and henkilo_id in (SELECT henkilo.id FROM henkilo WHERE henkilo.turvakielto=true);

