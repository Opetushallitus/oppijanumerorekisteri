
alter table tuonti
  add ilmoitustarve_kasitelty boolean default false;

update tuonti
  set ilmoitustarve_kasitelty = true;