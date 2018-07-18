alter table yksilointivirhe
    add column uudelleenyritys_maara integer,
    add column uudelleenyritys_aikaleima timestamp without time zone;

alter table henkilo
    drop column if exists ei_yksiloida;

delete from yksilointivirhe where poikkeus != 'fi.vm.sade.oppijanumerorekisteri.exceptions.SuspendableIdentificationException';
