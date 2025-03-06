create table if not exists testidatantuonti_henkilo (
    hetu text not null,
    etunimet text not null,
    sukunimi text not null,
    syntymaaika date not null,
    kuolinpaiva date,
    sukupuoli integer not null,
    turvakielto boolean not null,
    kotikunta text,
    aidinkieli text,
    kansalaisuudet text,
    huoltajat text,
    katuosoite text,
    postinumero text,
    kaupunki text
);

create index if not exists testidatantuonti_henkilo_hetu_idx
on testidatantuonti_henkilo (hetu);
