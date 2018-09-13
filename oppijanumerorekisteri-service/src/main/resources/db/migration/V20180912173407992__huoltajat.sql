create table if not exists henkilo_huoltaja (
  id bigint primary key,
  version bigint NOT NULL,
  henkilo_id bigint NOT NULL references henkilo(id),
  huoltaja_id bigint NOT NULL references henkilo(id)
)

alter table henkilo drop column if exists huoltaja_id;

alter table henkilo_aud drop column if exists huoltaja_id;
