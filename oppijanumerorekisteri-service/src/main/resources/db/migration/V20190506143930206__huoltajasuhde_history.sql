create table if not exists henkilo_huoltaja_suhde_aud (
      id int8 not null,
      rev int4 not null,
      revtype int2,
      huoltajuustyyppi_koodi varchar(255),
      huoltaja_id int8,
      lapsi_id int8,
      primary key (id, rev)
  );