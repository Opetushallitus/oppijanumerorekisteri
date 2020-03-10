alter table henkilo_huoltaja_suhde add column created timestamp without time zone NOT NULL DEFAULT now();
alter table henkilo_huoltaja_suhde add column updated timestamp without time zone NOT NULL DEFAULT now();

alter table henkilo_huoltaja_suhde_aud add column updated timestamp without time zone NOT NULL DEFAULT now();
alter table henkilo_huoltaja_suhde_aud add column created timestamp without time zone NOT NULL DEFAULT now();

create index henkilo_huoltaja_suhde_updated_idx
    on henkilo_huoltaja_suhde (updated);

update
  henkilo_huoltaja_suhde hs
  set updated=to_timestamp(r.revtstmp / 1000), created=to_timestamp(r.revtstmp / 1000)
  from revinfo r, henkilo_huoltaja_suhde_aud hsa
    where hs.lapsi_id=hsa.lapsi_id and hs.huoltaja_id=hsa.huoltaja_id and hsa.rev=r.rev;