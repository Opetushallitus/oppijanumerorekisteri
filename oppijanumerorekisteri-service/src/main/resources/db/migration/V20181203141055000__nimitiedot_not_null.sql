
update henkilo set kutsumanimi = henkilo.etunimet where kutsumanimi is null or kutsumanimi = '';

alter table henkilo
    alter column etunimet set not null;

alter table henkilo
    alter column kutsumanimi set not null;

alter table henkilo
    alter column sukunimi set not null;