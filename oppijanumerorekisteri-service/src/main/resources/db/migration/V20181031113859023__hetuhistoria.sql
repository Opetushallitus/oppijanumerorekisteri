create table henkilo_hetu (
    henkilo_id int8 not null,
    hetu varchar(255) not null,
    primary key (henkilo_id, hetu)
);

insert into henkilo_hetu (henkilo_id, hetu)
select id, hetu from henkilo where hetu is not null and yksiloityvtj = true;

alter table henkilo_hetu
    add constraint uk_henkilo_hetu_01 unique (hetu);

alter table henkilo_hetu
    add constraint fk_henkilo_hetu_henkilo
    foreign key (henkilo_id)
    references public.henkilo;

alter table yksilointitieto add column hetu varchar(255);
