create table yksiloity_hetu (
    henkilo_id int8 not null,
    hetu varchar(255) not null,
    primary key (henkilo_id, hetu)
);

insert into yksiloity_hetu (henkilo_id, hetu)
select id, hetu from henkilo where hetu is not null and yksiloityvtj = true;

alter table yksiloity_hetu
    add constraint uk_yksiloity_hetu_01 unique (hetu);

alter table yksiloity_hetu
    add constraint fk_yksiloity_hetu
    foreign key (henkilo_id)
    references public.henkilo;

alter table yksilointitieto add column hetu varchar(255);
