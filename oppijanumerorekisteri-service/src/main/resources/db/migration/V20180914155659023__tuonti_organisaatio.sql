create table tuonti_organisaatio (
    tuonti_id int8 not null,
    organisaatio_id int8 not null,
    primary key (tuonti_id, organisaatio_id)
);

alter table tuonti_organisaatio
    add constraint fk_tuonti_organisaatio_organisaatio
    foreign key (organisaatio_id)
    references organisaatio;

alter table tuonti_organisaatio
    add constraint fk_tuonti_organisaatio_tuonti
    foreign key (tuonti_id)
    references tuonti;
