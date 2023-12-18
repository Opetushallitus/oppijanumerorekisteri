CREATE TABLE public.turvakielto_kotikunta (
    id bigint primary key,
    version bigint not null,
    henkilo_id bigint not null,
    kotikunta text not null
);

ALTER TABLE public.turvakielto_kotikunta
    ADD CONSTRAINT fk_turvakielto_kotikunta_henkilo_id
    FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);

CREATE INDEX IF NOT EXISTS turvakielto_kotikunta_henkilo_id_idx ON turvakielto_kotikunta USING btree (henkilo_id);