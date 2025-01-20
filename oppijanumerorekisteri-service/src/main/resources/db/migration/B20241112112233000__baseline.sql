create extension if not exists unaccent;
create extension if not exists pg_trgm;

create sequence hibernate_sequence;

create function date_to_char(date) returns text
    immutable
    language sql
as
$$ select coalesce(to_char($1, 'YYYY-MM-DD'), ''); $$;

create function duplicate_search_fmt(text) returns text
    immutable
    language sql
as
$$ SELECT lower(public.unaccent($1)); $$;

create table cas_client_session
(
    mapping_id text not null
        primary key,
    session_id text not null
        unique
);

comment on column cas_client_session.mapping_id is 'Tekninen.';

create table henkilo_bu
(
    id                 bigint,
    version            bigint,
    etunimet           varchar(255),
    hetu               varchar(255),
    kayttajatunnus     varchar(255),
    kotikunta          varchar(255),
    kutsumanimi        varchar(255),
    oidhenkilo         varchar(255),
    sukunimi           varchar(255),
    sukupuoli          varchar(255),
    turvakielto        boolean,
    henkilotyyppi      varchar(255),
    eisuomalaistahetua boolean,
    asiointikieli_id   bigint,
    passivoitu         boolean,
    yksiloity          boolean,
    oppijanumero       varchar(255)
);

create table henkilo_huoltaja_suhde_aud
(
    id          bigint  not null,
    rev         integer not null,
    revtype     smallint,
    huoltaja_id bigint,
    lapsi_id    bigint,
    updated     timestamp default now(),
    created     timestamp default now(),
    alkupvm     date,
    loppupvm    date,
    primary key (id, rev)
);

create table henkiloviite
(
    id         bigint       not null,
    version    bigint       not null,
    master_oid varchar(255) not null,
    slave_oid  varchar(255) not null
)
    with (autovacuum_vacuum_scale_factor = 0.0, autovacuum_vacuum_threshold = 1000, autovacuum_analyze_scale_factor = 0.0, autovacuum_analyze_threshold = 1000);

comment on column henkiloviite.id is 'Henkilön duplikaattihaun henkilöviitteet.';

comment on column henkiloviite.version is 'Tekninen, optimistinen lukitus.';

comment on column henkiloviite.master_oid is 'Omistavan henkilön oid.';

comment on column henkiloviite.slave_oid is 'Omistavan henkilön mahdollisen duplikaattihenkilön oid.';

create index henkiloviite_master_idx
    on henkiloviite (master_oid);

create index henkiloviite_master_oid_idx
    on henkiloviite (master_oid);

create index henkiloviite_slave_idx
    on henkiloviite (slave_oid);

create index henkiloviite_slave_oid_idx
    on henkiloviite (slave_oid);

create table kansalaisuus
(
    id                bigint       not null
        primary key,
    version           bigint       not null,
    kansalaisuuskoodi varchar(255) not null
);

comment on column kansalaisuus.id is 'Henkilön kansalaisuudet.';

comment on column kansalaisuus.version is 'Tekninen, optimistinen lukitus.';

comment on column kansalaisuus.kansalaisuuskoodi is 'Yksittäinen kansalaisuuskoodi.';

create table kielisyys
(
    id          bigint not null
        primary key,
    version     bigint not null,
    kielikoodi  varchar(255)
        unique,
    kielityyppi varchar(255)
);

comment on column kielisyys.id is 'Kansalaisuuden tietokantaid.';

comment on column kielisyys.version is 'Tekninen, optimistinen lukitus.';

comment on column kielisyys.kielikoodi is 'Kansalaisuuden kielen koodi, Koodisto: kieli.';

comment on column kielisyys.kielityyppi is 'Kansalaisuuden kielen tyyppi.';

create table henkilo
(
    id                   bigint                  not null
        primary key,
    version              bigint                  not null,
    etunimet             varchar(255)            not null,
    hetu                 varchar(255)
        unique,
    kotikunta            varchar(255),
    kutsumanimi          varchar(255)            not null,
    oidhenkilo           varchar(255)            not null
        unique,
    sukunimi             varchar(255)            not null,
    sukupuoli            varchar(255),
    turvakielto          boolean   default false not null,
    eisuomalaistahetua   boolean   default false not null,
    asiointikieli_id     bigint
        constraint fk3021ddf2565e98a4
            references kielisyys,
    passivoitu           boolean   default false not null,
    yksiloity            boolean   default false not null,
    query_hetu           varchar(255),
    syntymaaika          date,
    duplicate            boolean   default false not null,
    aidinkieli_id        bigint
        constraint fk24c7f3776ba553a1
            references kielisyys,
    yksilointi_yritetty  boolean   default false not null,
    created              timestamp default now() not null,
    modified             timestamp default now() not null,
    kasittelija          varchar(255),
    yksiloityvtj         boolean   default false not null,
    vtjsync_timestamp    timestamp with time zone,
    kuolinpaiva          date,
    vtj_register         boolean   default false not null,
    kuolinsiivous        varchar(255),
    duplicate_search_str text generated always as (duplicate_search_fmt((
        ((((((etunimet)::text || ' '::text) || (kutsumanimi)::text) || ' '::text) || (sukunimi)::text) || ' '::text) ||
        date_to_char(syntymaaika)))) stored,
    vtj_bucket           bigint
)
    with (autovacuum_vacuum_scale_factor = 0.0, autovacuum_vacuum_threshold = 1000, autovacuum_analyze_scale_factor = 0.0, autovacuum_analyze_threshold = 1000);

comment on column henkilo.id is 'Sisäinen tietokantaid henkilölle.';

comment on column henkilo.version is 'Optimistinen lukitus, kaksi transaktiota ei voi päivittää jos data on muuttunut.';

comment on column henkilo.etunimet is 'Henkilön etunimet.';

comment on column henkilo.hetu is 'Henkilön hetu.';

comment on column henkilo.kotikunta is 'Koodisto:kunta.';

comment on column henkilo.kutsumanimi is 'Henkilön haluama kutsumanimi, kutsumanimen tulee olla yksi henkilön etunimistä. ';

comment on column henkilo.oidhenkilo is 'Henkilön uniikki oid tunniste.';

comment on column henkilo.sukunimi is 'Henkilön sukunimi.';

comment on column henkilo.sukupuoli is 'Koodisto:sukupuoli.';

comment on column henkilo.turvakielto is 'VTJ:stä saatava tieto onko turvakieltoa.';

comment on column henkilo.eisuomalaistahetua is 'Onko henkilöllä suomalaista hetua. Käytetään suoritusrekisterissä.';

comment on column henkilo.asiointikieli_id is 'Asiointikieli, ei tule VTJ:n tietojen perusteella, Koodisto: kieli.';

comment on column henkilo.passivoitu is 'Henkilöä ei poisteta koskaan, se passivoidaan.';

comment on column henkilo.yksiloity is 'Onko oppija yksilöity (hetuttomille, manuaalinen).';

comment on column henkilo.syntymaaika is 'Henkilön syntymäaika.';

comment on column henkilo.duplicate is 'Onko tämä henkilö jonkun toisen henkilön duplikaatti. (Joku toinen on master)';

comment on column henkilo.aidinkieli_id is 'Henkilön äidinkieli. Syntyy VTJ:stä hetullisille, Koodisto: kieli.';

comment on column henkilo.yksilointi_yritetty is 'Onko automaattista yksilöintiä yritetty. Käytetään asynkronisessa VTJ käsittelijässä.';

comment on column henkilo.created is 'Luontipäivä.';

comment on column henkilo.modified is 'Viimeisin muokkausaika.';

comment on column henkilo.kasittelija is 'Viimeksi muokanneen virkailijan oid. Järjestelmän tekemissä muutoksissa käsittelijä pysyy samana.';

comment on column henkilo.yksiloityvtj is 'Onko oppija yksilöity (hetullisille, automaattinen).';

comment on column henkilo.vtjsync_timestamp is 'Viimeisimmän henkilön tietojen VTJ synkronoinnin timestamp.';

comment on column henkilo.kuolinpaiva is 'VTJ:stä saatava tieto kuolinpäivästä.';

comment on column henkilo.vtj_register is 'Onko henkilö mukana VTJ synkronoinnissa.';

create table externalid
(
    id         bigint       not null
        primary key,
    version    bigint       not null,
    externalid varchar(255) not null,
    henkilo_id bigint       not null
        constraint fk_externalid_henkilo
            references henkilo
);

comment on column externalid.externalid is 'Tekninen.';

create unique index externalid_externalid_idx
    on externalid (externalid);

create index henkilo_created_idx
    on henkilo (created);

create index henkilo_etunimet_idx
    on henkilo (etunimet);

create index henkilo_etunimet_lower_idx
    on henkilo (lower(etunimet::text) text_pattern_ops);

create index henkilo_kotikunta_idx
    on henkilo (kotikunta);

create index henkilo_kutsumanimi_idx
    on henkilo (kutsumanimi);

create index henkilo_kutsumanimi_lower_idx
    on henkilo (lower(kutsumanimi::text) text_pattern_ops);

create index henkilo_modified_idx
    on henkilo (modified);

create index henkilo_name_similarity
    on henkilo using gin (duplicate_search_str gin_trgm_ops);

create index henkilo_oid_idx
    on henkilo (oidhenkilo);

create index henkilo_pass_idx
    on henkilo (passivoitu);

create index henkilo_query_hetu_idx
    on henkilo (query_hetu);

create index henkilo_sukunimi_idx
    on henkilo (sukunimi);

create index henkilo_sukunimi_lower_idx
    on henkilo (lower(sukunimi::text) text_pattern_ops);

create index henkilo_syntymaaika_idx
    on henkilo (syntymaaika);

create index henkilo_vtj_bucket_idx
    on henkilo (vtj_bucket);

create index henkilo_yksiloityvtj_hetu_idx
    on henkilo (yksiloityvtj, hetu);

create index hetu_idx
    on henkilo (hetu);

create index query_hetu_idx
    on henkilo (query_hetu);

create table henkilo_hetu
(
    henkilo_id bigint       not null
        constraint fk_henkilo_hetu_henkilo
            references henkilo,
    hetu       varchar(255) not null
        constraint uk_henkilo_hetu_01
            unique,
    primary key (henkilo_id, hetu)
);

comment on column henkilo_hetu.henkilo_id is 'Viittaustaulu, Henkilön kaikki viralliset hetut (nykyinen ja joskus käytössä olleet). Ei sisällä yksilöimättömien henkilöiden hetuja.';

comment on column henkilo_hetu.hetu is 'Henkilön hetu.';

create table henkilo_huoltaja_suhde
(
    id          bigint                  not null
        primary key,
    version     bigint                  not null,
    lapsi_id    bigint                  not null
        references henkilo,
    huoltaja_id bigint                  not null
        references henkilo,
    created     timestamp default now() not null,
    updated     timestamp default now() not null,
    alkupvm     date,
    loppupvm    date
);

comment on column henkilo_huoltaja_suhde.id is 'Henkilöhuoltajasuhteen tietokantaid.';

comment on column henkilo_huoltaja_suhde.version is 'Tekninen, optimistinen lukitus.';

comment on column henkilo_huoltaja_suhde.lapsi_id is 'Lapsen henkilötaulun tietokantaid.';

comment on column henkilo_huoltaja_suhde.huoltaja_id is 'Huoltajan henkilötaulun tietokantaid.';

create index henkilo_huoltaja_suhde_updated_idx
    on henkilo_huoltaja_suhde (updated);

create table henkilo_kansalaisuus
(
    henkilo_id      bigint not null
        constraint fkd8005c5b620670b2
            references henkilo,
    kansalaisuus_id bigint not null
        constraint fkd8005c5b992bc1c2
            references kansalaisuus,
    primary key (henkilo_id, kansalaisuus_id)
)
    with (autovacuum_vacuum_scale_factor = 0.0, autovacuum_vacuum_threshold = 1000, autovacuum_analyze_scale_factor = 0.0, autovacuum_analyze_threshold = 1000);

comment on column henkilo_kansalaisuus.henkilo_id is 'Viittaustaulu, yhdellä henkilöllä voi olla monta kansalaisuutta.';

comment on column henkilo_kansalaisuus.kansalaisuus_id is 'Koodisto: maatjavaltiot2, henkilön kansalaisuustaulun kantaid.';

create table henkilo_kielisyys
(
    henkilo_id   bigint not null
        constraint fk41b7e277620670b2
            references henkilo,
    kielisyys_id bigint not null
        constraint fk41b7e27769456172
            references kielisyys,
    primary key (henkilo_id, kielisyys_id)
);

comment on column henkilo_kielisyys.henkilo_id is 'Viittaustaulu, yhdellä henkilöllä voi olla useampi äidinkieli ja asiointikieli.';

comment on column henkilo_kielisyys.kielisyys_id is 'Kielisyyden kantaid.';

create table henkilo_passinumero
(
    henkilo_id  bigint       not null
        constraint fk_henkilo_passinumero
            references henkilo,
    passinumero varchar(255) not null
        constraint uk_passinumero_01
            unique,
    primary key (henkilo_id, passinumero)
);

comment on column henkilo_passinumero.henkilo_id is 'Viittaustaulu. Henkilön passinumero.';

comment on column henkilo_passinumero.passinumero is 'Henkilön passinumero. Syntyy hakemukselta.';

create table identification
(
    id          bigint       not null
        primary key,
    version     bigint       not null,
    identifier  text         not null,
    idpentityid varchar(255) not null,
    henkilo_id  bigint       not null
        constraint fk187d426e620670b2
            references henkilo
)
    with (autovacuum_vacuum_scale_factor = 0.0, autovacuum_vacuum_threshold = 1000, autovacuum_analyze_scale_factor = 0.0, autovacuum_analyze_threshold = 1000);

create index identification_henkilo_id_idx
    on identification (henkilo_id);

create index identifier_idx
    on identification (identifier);

create unique index unique_identifier_eidas_idx
    on identification (identifier)
    where ((idpentityid)::text = 'eidas'::text);

create table kjhh_2422_invalid_identification
(
    id                 bigint,
    version            bigint,
    authtoken          varchar(255),
    email              varchar(255),
    identifier         varchar(255),
    idpentityid        varchar(255),
    henkilo_id         bigint,
    expiration_date    timestamp,
    auth_token_created timestamp
);

create table kotikunta_historia
(
    id                     bigint not null
        primary key,
    version                bigint not null,
    henkilo_id             bigint not null
        constraint fk_kotikunta_historia_henkilo_id
            references henkilo,
    kotikunta              text   not null,
    kuntaan_muuttopv       date,
    kunnasta_pois_muuttopv date
);

create table kotikunta_historia_mass_update
(
    henkilo_id bigint                not null
        primary key,
    updated    boolean default false not null
);

create table organisaatio
(
    id      bigint       not null
        primary key,
    version bigint       not null,
    oid     varchar(255) not null
        constraint uk_organisaatio_01
            unique
);

comment on column organisaatio.id is 'Organisaation tietokantaid.';

comment on column organisaatio.version is 'Tekninen, optimistinen lukitus.';

comment on column organisaatio.oid is 'Oppijan organisaatio oid, haun tehostamiseksi.';

create table henkilo_organisaatio
(
    henkilo_id      bigint not null
        constraint fk_henkilo_organisaatio_henkilo
            references henkilo,
    organisaatio_id bigint not null
        constraint fk_henkilo_organisaatio_organisaatio
            references organisaatio,
    primary key (henkilo_id, organisaatio_id)
);

comment on column henkilo_organisaatio.henkilo_id is 'Viittaustaulu. Oppijan organisaatiot (oppijan tuonti ja muutospalvelu).';

comment on column henkilo_organisaatio.organisaatio_id is 'Oppijan organisaation kantaid.';

create table queuedemailstatus
(
    id          text not null
        primary key,
    description text not null
);

create table queuedemail
(
    id                   uuid                                not null
        primary key,
    queuedemailstatus_id text                                not null
        references queuedemailstatus,
    recipients           text[]                              not null
        constraint recipients_required
            check (recipients <> '{}'::text[]),
    replyto              text,
    subject              text                                not null,
    body                 text                                not null,
    lahetystunniste      text,
    copy                 text,
    created              timestamp default CURRENT_TIMESTAMP not null,
    modified             timestamp default CURRENT_TIMESTAMP not null,
    last_attempt         timestamp,
    sent_at              timestamp,
    batch_sent           integer   default 0                 not null,
    idempotency_key      uuid                                not null,
    constraint sent_at_requires_status_sent
        check (((queuedemailstatus_id = 'SENT'::text) AND (sent_at IS NOT NULL)) OR
               (queuedemailstatus_id <> 'SENT'::text)),
    constraint sent_has_to_have_lahetystunniste
        check (((queuedemailstatus_id = 'SENT'::text) AND (lahetystunniste IS NOT NULL)) OR
               (queuedemailstatus_id <> 'SENT'::text))
);

create table revinfo
(
    rev      integer not null
        primary key,
    revtstmp bigint
);

comment on column revinfo.rev is 'Tekninen. Taulujen automaattiauditointiin liittyvä.';

create table henkilo_aud
(
    id                  bigint  not null,
    rev                 integer not null
        constraint fk51lq458r1exfr6c6tswgk8n3e
            references revinfo,
    revtype             smallint,
    created             timestamp,
    duplicate           boolean,
    eisuomalaistahetua  boolean,
    ei_yksiloida        boolean,
    etunimet            varchar(255),
    hetu                varchar(255),
    kasittelija         varchar(255),
    kotikunta           varchar(255),
    kuolinpaiva         date,
    kutsumanimi         varchar(255),
    modified            timestamp,
    oidhenkilo          varchar(255),
    oppijanumero        varchar(255),
    passivoitu          boolean,
    sukunimi            varchar(255),
    sukupuoli           varchar(255),
    syntymaaika         date,
    turvakielto         boolean,
    vtj_register        boolean default false,
    vtjsync_timestamp   timestamp,
    yksilointi_yritetty boolean,
    yksiloity           boolean,
    yksiloityvtj        boolean,
    aidinkieli_id       bigint,
    asiointikieli_id    bigint,
    kuolinsiivous       varchar(255),
    vtj_bucket          bigint,
    primary key (id, rev)
);

create table henkilo_kansalaisuus_aud
(
    rev             integer not null
        constraint fkqxc9bei86pmc2oduhmsfn1h4t
            references revinfo,
    henkilo_id      bigint  not null,
    kansalaisuus_id bigint  not null,
    revtype         smallint,
    primary key (rev, henkilo_id, kansalaisuus_id)
);

create table henkilo_kielisyys_aud
(
    rev          integer not null
        constraint fkdv42xjyagek2570e9ftgfx1wp
            references revinfo,
    henkilo_id   bigint  not null,
    kielisyys_id bigint  not null,
    revtype      smallint,
    primary key (rev, henkilo_id, kielisyys_id)
);

create table henkilo_organisaatio_aud
(
    rev             integer not null
        constraint fk1lnfibi79dla4p3yr6nqr2uu1
            references revinfo,
    henkilo_id      bigint  not null,
    organisaatio_id bigint  not null,
    revtype         smallint,
    primary key (rev, henkilo_id, organisaatio_id)
);

create table henkilo_passinumero_aud
(
    rev         integer      not null
        constraint fk15eutxmeqyb0v9v43yye2blxj
            references revinfo,
    henkilo_id  bigint       not null,
    passinumero varchar(255) not null,
    revtype     smallint,
    primary key (rev, henkilo_id, passinumero)
);

create table scheduled_tasks
(
    task_name            text                     not null,
    task_instance        text                     not null,
    task_data            bytea,
    execution_time       timestamp with time zone not null,
    picked               boolean                  not null,
    picked_by            text,
    last_success         timestamp with time zone,
    last_failure         timestamp with time zone,
    last_heartbeat       timestamp with time zone,
    version              bigint                   not null,
    consecutive_failures integer,
    primary key (task_name, task_instance)
);

comment on column scheduled_tasks.consecutive_failures is 'Tekninen. Ajastettujen taskien tiedot.';

create table spring_session
(
    primary_id            char(36) not null
        constraint spring_session_pk
            primary key,
    session_id            char(36) not null,
    creation_time         bigint   not null,
    last_access_time      bigint   not null,
    max_inactive_interval integer  not null,
    expiry_time           bigint   not null,
    principal_name        varchar(100)
);

comment on column spring_session.creation_time is 'Tekninen. Palvelun sessioiden tiedot.';

create unique index spring_session_ix1
    on spring_session (session_id);

create index spring_session_ix2
    on spring_session (expiry_time);

create index spring_session_ix3
    on spring_session (principal_name);

create table spring_session_attributes
(
    session_primary_id char(36)     not null
        constraint spring_session_attributes_fk
            references spring_session
            on delete cascade,
    attribute_name     varchar(200) not null,
    attribute_bytes    bytea        not null,
    constraint spring_session_attributes_pk
        primary key (session_primary_id, attribute_name)
);

comment on column spring_session_attributes.attribute_bytes is 'Tekninen. Palvelun sessioiden tiedot.';

create index spring_session_attributes_ix1
    on spring_session_attributes (session_primary_id);

create table tuonti_data
(
    id      bigint not null
        primary key,
    version bigint not null,
    data    oid    not null
);

create table tuonti
(
    id                      bigint                              not null
        primary key,
    version                 bigint                              not null,
    sahkoposti              varchar(255),
    kasiteltavia            integer                             not null,
    kasiteltyja             integer                             not null,
    kasittelija_oid         varchar(255),
    data_id                 bigint
        constraint fk_tuonti_tuonti_data
            references tuonti_data,
    ilmoitustarve_kasitelty boolean   default false,
    aikaleima               timestamp default CURRENT_TIMESTAMP not null,
    api                     text
);

comment on column tuonti.data_id is 'Oppijan tuonnin dataa.';

create index tuonti_aikaleima_idx
    on tuonti (aikaleima);

create index tuonti_kasittelija_idx
    on tuonti (kasittelija_oid);

create table tuonti_organisaatio
(
    tuonti_id       bigint not null
        constraint fk_tuonti_organisaatio_tuonti
            references tuonti,
    organisaatio_id bigint not null
        constraint fk_tuonti_organisaatio_organisaatio
            references organisaatio,
    primary key (tuonti_id, organisaatio_id)
);

comment on column tuonti_organisaatio.organisaatio_id is 'Oppijan tuonnin dataa.';

create table tuonti_rivi
(
    id         bigint not null
        primary key,
    version    bigint not null,
    tunniste   varchar(255),
    henkilo_id bigint not null
        constraint fk_tuonti_rivi_henkilo
            references henkilo,
    tuonti_id  bigint not null
        constraint fk_tuonti_rivi_tuonti
            references tuonti,
    conflict   boolean
);

comment on column tuonti_rivi.henkilo_id is 'Oppijan tuonnin dataa.';

create index ix_tuonti_rivi_01
    on tuonti_rivi (tuonti_id, henkilo_id);

create table turvakielto_kotikunta
(
    id         bigint not null
        primary key,
    version    bigint not null,
    henkilo_id bigint not null
        constraint unique_turvakielto_kotikunta_henkilo_id
            unique
        constraint fk_turvakielto_kotikunta_henkilo_id
            references henkilo,
    kotikunta  text   not null
);

create index turvakielto_kotikunta_henkilo_id_idx
    on turvakielto_kotikunta (henkilo_id);

create table turvakielto_kotikunta_historia
(
    id                     bigint not null
        primary key,
    version                bigint not null,
    henkilo_id             bigint not null
        constraint fk_turvakielto_kotikunta_historia_henkilo_id
            references henkilo,
    kotikunta              text   not null,
    kuntaan_muuttopv       date,
    kunnasta_pois_muuttopv date
);

create table vtj_muutostieto
(
    id            bigint    not null
        primary key,
    version       bigint    not null,
    henkilotunnus text      not null,
    muutospv      timestamp not null,
    tietoryhmat   jsonb     not null,
    processed     timestamp,
    error         boolean default false
);

create index vtj_muutostieto_error_idx
    on vtj_muutostieto (error);

create index vtj_muutostieto_henkilotunnus_idx
    on vtj_muutostieto (henkilotunnus);

create index vtj_muutostieto_muutospv_idx
    on vtj_muutostieto (muutospv);

create index vtj_muutostieto_processed_idx
    on vtj_muutostieto (processed);

create table vtj_muutostieto_kirjausavain
(
    id         bigint not null
        primary key,
    avain      bigint not null,
    updated_at timestamp default CURRENT_TIMESTAMP
);

create table yksilointitieto
(
    id            bigint                not null
        constraint yksilointi_tiedot_pkey
            primary key,
    version       bigint                not null,
    henkiloid     bigint                not null
        constraint yksilointi_tiedot_henkiloid_key
            unique
        constraint fka02a62f3dc0430b7
            references henkilo,
    etunimet      varchar(255),
    kutsumanimi   varchar(255),
    sukunimi      varchar(255),
    sukupuoli     varchar(255),
    aidinkieli_id bigint
        constraint fk36b34d7566a263b2
            references kielisyys,
    turvakielto   boolean default false not null,
    kotikunta     varchar(255),
    hetu          varchar(255)
);

comment on column yksilointitieto.id is 'Tekninen, yksilöintitiedon tietokantaid.';

comment on column yksilointitieto.version is 'Tekninen, optimistinen lukitus.';

comment on column yksilointitieto.henkiloid is 'Henkilön uniikki oid tunniste.';

comment on column yksilointitieto.etunimet is 'Henkilön etunimet.';

comment on column yksilointitieto.kutsumanimi is 'Henkilön kutsumanimi.';

comment on column yksilointitieto.sukunimi is 'Henkilön sukunimi.';

comment on column yksilointitieto.sukupuoli is 'Henkilön sukupuoli.';

comment on column yksilointitieto.aidinkieli_id is 'Henkilön yksilöintitiedot VTJ:stä tai manuaalisesti luotuna joilla voidaan korvata henkilön perustiedot.';

comment on column yksilointitieto.turvakielto is 'Onko henkilö asetettu turvakieltoon.';

comment on column yksilointitieto.kotikunta is 'Henkilön kotikunta.';

comment on column yksilointitieto.hetu is 'Henkilön hetu.';

create table yhteystiedotryhma
(
    id                  bigint                not null
        primary key,
    version             bigint                not null,
    ryhmakuvaus         varchar(255),
    henkilo_id          bigint
        constraint fkd2b4a4cf620670b2
            references henkilo,
    ryhma_alkuperatieto varchar(255)          not null,
    read_only           boolean default false not null,
    yksilointitieto_id  bigint
        constraint fkd2b4b4cf46057a12
            references yksilointitieto
)
    with (autovacuum_vacuum_scale_factor = 0.0, autovacuum_vacuum_threshold = 1000, autovacuum_analyze_scale_factor = 0.0, autovacuum_analyze_threshold = 1000);

comment on column yhteystiedotryhma.id is 'Yhteistietoryhmän tietokantaid.';

comment on column yhteystiedotryhma.version is 'Tekninen. Optimistinen lukitus.';

comment on column yhteystiedotryhma.ryhmakuvaus is 'Koodisto: yhteystietotyypit.';

comment on column yhteystiedotryhma.henkilo_id is 'Henkilön tietokantaid.';

comment on column yhteystiedotryhma.ryhma_alkuperatieto is 'Koodisto: yhteystietojenalkupera.';

comment on column yhteystiedotryhma.read_only is 'Saako yhteystietoa päivittää. (VTJ yhteystiedot ovat lukitut).';

create table yhteystiedot
(
    id                   bigint       not null
        primary key,
    version              bigint       not null,
    yhteystieto_tyyppi   varchar(255) not null,
    yhteystieto_arvo     varchar(255),
    yhteystiedotryhma_id bigint       not null
        constraint fkd2b8f4cf620670b2
            references yhteystiedotryhma
)
    with (autovacuum_vacuum_scale_factor = 0.0, autovacuum_vacuum_threshold = 1000, autovacuum_analyze_scale_factor = 0.0, autovacuum_analyze_threshold = 1000);

comment on column yhteystiedot.id is 'Yhteistiedon tietokantaid.';

comment on column yhteystiedot.version is 'Tekninen. Optimistinen lukitus.';

comment on column yhteystiedot.yhteystieto_tyyppi is 'Enumeraatio, mikä yhteystietotyyppi on kyseessä. YHTEYSTIETO_SAHKOPOSTI, PUHELINNUMERO, MATKAPUHELINNUMERO, KATUOSOITE, KUNTA, POSTINUMERO, KAUPUNKI, MAA.';

comment on column yhteystiedot.yhteystieto_arvo is 'Yhteystieto.';

comment on column yhteystiedot.yhteystiedotryhma_id is 'Tekninen. Viittaus.';

create index yhteystiedot_yhteystiedotryhma_id_idx
    on yhteystiedot (yhteystiedotryhma_id);

create index yhteystiedot_yhteystieto_arvo_idx
    on yhteystiedot (yhteystieto_arvo);

create index yhteystiedotryhma_henkilo_id_idx
    on yhteystiedotryhma (henkilo_id);

create table yksilointi_kansalaisuus
(
    yksilointitieto_id bigint not null
        constraint fk41c7a27769456177
            references yksilointitieto,
    kansalaisuus_id    bigint not null
        constraint fk31a7f27569a56372
            references kansalaisuus
);

create table yksilointivirhe
(
    id                        bigint    not null
        primary key,
    version                   bigint    not null,
    aikaleima                 timestamp not null,
    poikkeus                  text      not null,
    viesti                    text,
    henkilo_id                bigint    not null
        constraint uk_yksilointivirhe_01
            unique
        constraint fk_yksilointivirhe_henkilo
            references henkilo,
    uudelleenyritys_maara     integer,
    uudelleenyritys_aikaleima timestamp
);

comment on column yksilointivirhe.id is 'Yksilöintivirheen tietokantaid.';

comment on column yksilointivirhe.version is 'Tekninen, optimistinen lukitus.';

comment on column yksilointivirhe.aikaleima is 'Yksilöinnissä tapahtuneen virheen aikaleima.';

comment on column yksilointivirhe.poikkeus is 'Yksilöintivirheen luomiseen johtanut tarkempi tekninen poikkeus.';

comment on column yksilointivirhe.viesti is 'Yksilöintivirheen selite.';

comment on column yksilointivirhe.henkilo_id is 'Viittaus henkilöön jonka yksilöintiä virhe koskee.';

comment on column yksilointivirhe.uudelleenyritys_maara is 'Kuinka monta kertaa yksilöinti on yritetty uudelleen.';

comment on column yksilointivirhe.uudelleenyritys_aikaleima is 'Viimeisimmän yksilöinnin uudelleen yrityksen aikaleima.';

create view tuontikooste
            (id, oid, author, timestamp, org, total, done, api, successful, conflicts, failures, inprogress) as
SELECT tmp.id,
    tmp.oid,
    tmp.author,
    tmp."timestamp",
    tmp.org,
    tmp.total,
    tmp.done,
    tmp.api,
    tmp.successful,
    tmp.conflicts,
    tmp.total - tmp.successful AS failures,
    tmp.total - tmp.done       AS inprogress
FROM (SELECT t.id,
          t.kasittelija_oid                                      AS oid,
          (h2.sukunimi::text || ', '::text) || h2.etunimet::text AS author,
          t.aikaleima                                            AS "timestamp",
          org.oid                                                AS org,
          t.kasiteltavia                                         AS total,
          t.kasiteltyja                                          AS done,
          t.api,
          sum(
                  CASE
                  WHEN h.passivoitu OR h.duplicate OR h.yksiloity OR h.yksiloityvtj THEN 1
                  ELSE 0
                      END)                                       AS successful,
          sum(
                  CASE
                  WHEN tr.conflict THEN 1
                  ELSE 0
                      END)                                       AS conflicts
      FROM tuonti t
               JOIN tuonti_organisaatio torg ON t.id = torg.tuonti_id
               JOIN organisaatio org ON org.id = torg.organisaatio_id
               LEFT JOIN tuonti_rivi tr ON t.id = tr.tuonti_id
               LEFT JOIN henkilo h ON tr.henkilo_id = h.id
               LEFT JOIN henkilo h2 ON t.kasittelija_oid::text = h2.oidhenkilo::text
      GROUP BY t.id, org.oid, ((h2.sukunimi::text || ', '::text) || h2.etunimet::text), t.aikaleima) tmp;

create function arkistoi_arvosana_deltat(amount integer) returns integer
    language plpgsql
as
$$
DECLARE
    _resource_id varchar(200);
    _inserted bigint;
    _count int := 0;
    delta record;
BEGIN
    FOR delta IN
        SELECT resource_id, inserted FROM arvosana
        EXCEPT
        SELECT resource_id, inserted FROM v_arvosana
        LIMIT amount
        LOOP
            INSERT INTO a_arvosana SELECT * FROM arvosana WHERE resource_id = delta.resource_id AND inserted = delta.inserted;
            DELETE FROM arvosana WHERE resource_id = delta.resource_id AND inserted = delta.inserted;
            _count := _count + 1;
            RAISE NOTICE '%: archived delta: %, %', _count, delta.resource_id, delta.inserted;
        END LOOP;

    RETURN _count;
END;
$$;

create function fix_vtj_update_by_linking_henkilos(original_oid text, duplicate_oid text) returns void
    language plpgsql
as
$$
DECLARE
    current_hetu text;
BEGIN
    -- Store the new hetu from duplicate
    SELECT hetu INTO current_hetu FROM henkilo WHERE oidhenkilo = duplicate_oid;

    -- Remove VTJ ykislöinti from duplicate henkilo and mark it as duplicate
    UPDATE henkilo
    SET hetu = NULL,
        yksiloityvtj = false,
        vtj_register = false,
        duplicate = true,
        vtj_bucket = NULL,
        modified = current_timestamp
    WHERE oidhenkilo = duplicate_oid;

    -- Move hetu history from duplicate to original
    UPDATE henkilo_hetu
    SET henkilo_id = (SELECT id FROM henkilo WHERE oidhenkilo = original_oid)
    WHERE henkilo_id = (SELECT id FROM henkilo WHERE oidhenkilo = duplicate_oid);

    -- Update current hetu for original henkilo
    UPDATE henkilo
    SET hetu = current_hetu,
        vtj_bucket = NULL,
        modified = current_timestamp
    WHERE oidhenkilo = original_oid;

    -- Link the henkilos
    INSERT INTO henkiloviite (version, master_oid, slave_oid, id)
    VALUES (0, original_oid, duplicate_oid, nextval('hibernate_sequence'));
END;
$$;

create function force_retry_automaattinen_yksilointi(henkilo_oid text) returns void
    language plpgsql
as
$$
DECLARE
    yksiloitava_henkilo_id         bigint;
    yksiloitava_yksilointitieto_id bigint;
BEGIN
    SELECT id INTO yksiloitava_henkilo_id FROM henkilo WHERE oidhenkilo = henkilo_oid;
    SELECT id INTO yksiloitava_yksilointitieto_id FROM yksilointitieto WHERE henkiloid = yksiloitava_henkilo_id;

    DELETE
    FROM yhteystiedot
    WHERE yhteystiedotryhma_id IN
          (SELECT id FROM yhteystiedotryhma WHERE yksilointitieto_id = yksiloitava_yksilointitieto_id);
    DELETE FROM yksilointi_kansalaisuus WHERE yksilointitieto_id = yksiloitava_yksilointitieto_id;
    DELETE FROM yhteystiedotryhma WHERE yksilointitieto_id = yksiloitava_yksilointitieto_id;
    DELETE FROM yksilointitieto WHERE henkiloid = yksiloitava_henkilo_id;
    UPDATE scheduled_tasks SET execution_time = current_timestamp WHERE task_name = 'yksilointi task';
END;
$$;

create function insertkayttooikeus(character varying, character varying, character varying) returns integer
    language plpgsql
as
$$
declare
    palvelu_name alias for $1;
    kayttooikeus_rooli alias for $2;
    kayttooikeus_text_fi alias for $3;
    _kayttooikeus_exists bigint;

begin

    select count(*) into _kayttooikeus_exists from kayttooikeus k inner join palvelu p on p.id = k.palvelu_id where k.rooli = kayttooikeus_rooli and p.name = palvelu_name;

    IF _kayttooikeus_exists = 0 THEN
        insert into text_group (id, version) values (nextval('public.hibernate_sequence'), 1);
        insert into text (id, version, lang, text, textgroup_id) values (nextval('public.hibernate_sequence'), 1, 'FI', kayttooikeus_text_fi, (select max(id) from text_group));
        insert into text (id, version, lang, text, textgroup_id) values (nextval('public.hibernate_sequence'), 1, 'SV', kayttooikeus_text_fi, (select max(id) from text_group));
        insert into text (id, version, lang, text, textgroup_id) values (nextval('public.hibernate_sequence'), 1, 'EN', kayttooikeus_text_fi, (select max(id) from text_group));
        insert into kayttooikeus (id, version, palvelu_id, rooli, textgroup_id) values (nextval('public.hibernate_sequence'), 1, (select id from palvelu where name = palvelu_name), kayttooikeus_rooli, (select max(id) from text_group));
    end if;

    return 1;

end;

$$;

create function insertpalvelu(character varying, character varying) returns integer
    language plpgsql
as
$$
declare
    role_name alias for $1;
    role_text_fi alias for $2;
    _role_exists bigint;

begin

    select count(*) into _role_exists from palvelu where name = role_name;

    if _role_exists = 0 then
        insert into text_group (id, version) values (nextval('public.hibernate_sequence'), 1);
        insert into text (id, version, lang, text, textgroup_id) values (nextval('public.hibernate_sequence'), 1, 'FI', role_text_fi, (select max(id) from text_group));
        insert into text (id, version, lang, text, textgroup_id) values (nextval('public.hibernate_sequence'), 1, 'SV', role_text_fi, (select max(id) from text_group));
        insert into text (id, version, lang, text, textgroup_id) values (nextval('public.hibernate_sequence'), 1, 'EN', role_text_fi, (select max(id) from text_group));
        insert into palvelu (id, version, name, palvelutyyppi, textgroup_id) values (nextval('public.hibernate_sequence'), 1, role_name, 'YKSITTAINEN', (select max(id) from text_group));
    end if;

    return 1;

end;

$$;