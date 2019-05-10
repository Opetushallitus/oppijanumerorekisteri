create table if not exists henkilo_huoltaja_suhde_aud (
  rev integer NOT NULL,
  revtype smallint,
  id bigint primary key,
  lapsi_id bigint not null references henkilo(id),
  huoltaja_id bigint not null references henkilo(id),
  huoltajuustyyppi_koodi varchar(2) not null
);