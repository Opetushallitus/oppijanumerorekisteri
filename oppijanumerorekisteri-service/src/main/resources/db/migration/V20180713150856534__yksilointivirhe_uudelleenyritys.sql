alter table yksilointivirhe
    add column uudelleenyritys_maara type integer,
    add column uudelleenyritys_aikaleima type timestamp without time zone;

alter table henkilo
    drop column if exists ei_yksiloida;
