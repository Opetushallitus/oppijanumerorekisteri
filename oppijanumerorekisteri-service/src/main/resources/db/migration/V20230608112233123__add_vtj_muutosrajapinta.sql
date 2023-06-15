CREATE TABLE public.vtj_muutostieto_kirjausavain (
    id bigint not null,
    avain bigint not null,
    updated_at timestamp without time zone default current_timestamp
);

CREATE TABLE public.vtj_muutostieto (
    id bigint not null,
    version bigint not null,
    henkilotunnus text not null,
    muutospv timestamp without time zone not null,
    tietoryhmat jsonb not null
);

