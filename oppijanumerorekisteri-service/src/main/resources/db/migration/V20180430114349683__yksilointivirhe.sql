create table yksilointivirhe (
    id int8 not null,
    version int8 not null,
    aikaleima timestamp not null,
    poikkeus varchar(255) not null,
    viesti varchar(255),
    henkilo_id int8 not null,
    primary key (id)
);

alter table yksilointivirhe
    add constraint uk_yksilointivirhe_01 unique (henkilo_id);

alter table yksilointivirhe
    add constraint fk_yksilointivirhe_henkilo
    foreign key (henkilo_id)
    references public.henkilo;
