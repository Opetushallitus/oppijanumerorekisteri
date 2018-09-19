create table if not exists henkilo_huoltaja_suhde (
  id bigint primary key,
  version bigint not null,
  lapsi_id bigint not null references henkilo(id),
  huoltaja_id bigint not null references henkilo(id),
  huoltajuustyyppi_koodi varchar(2) not null
)

alter table henkilo drop column if exists huoltaja_id;

alter table henkilo_aud drop column if exists huoltaja_id;
