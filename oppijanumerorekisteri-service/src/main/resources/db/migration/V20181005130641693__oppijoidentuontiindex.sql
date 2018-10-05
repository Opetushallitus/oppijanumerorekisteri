alter table tuonti_rivi drop constraint uk_tuonti_rivi_01;
create index ix_tuonti_rivi_01 on tuonti_rivi (tuonti_id, henkilo_id);
