CREATE TABLE kotikunta_historia (
    id bigint primary key,
    version bigint not null,
    henkilo_id bigint not null,
    kotikunta text not null,
    kuntaan_muuttopv date not null,
    kunnasta_pois_muuttopv date not null
)

ALTER TABLE kotikunta_historia
    ADD CONSTRAINT fk_kotikunta_historia_henkilo_id
    FOREIGN KEY (henkilo_id) REFERENCES henkilo(id);

CREATE UNIQUE INDEX unique_kotikunta_historia_henkilo_id_idx
    ON kotikunta_historia (henkilo_id)
    WHERE kunnasta_pois_muuttopv IS NULL;

CREATE TABLE turvakielto_kotikunta_historia (
    id bigint primary key,
    version bigint not null,
    henkilo_id bigint not null,
    kotikunta text not null,
    kuntaan_muuttopv date not null,
    kunnasta_pois_muuttopv date not null
)

ALTER TABLE turvakielto_kotikunta_historia
    ADD CONSTRAINT fk_turvakielto_kotikunta_historia_henkilo_id
    FOREIGN KEY (henkilo_id) REFERENCES henkilo(id);

CREATE UNIQUE INDEX unique_turvakielto_kotikunta_historia_henkilo_id_idx
    ON turvakielto_kotikunta_historia (henkilo_id)
    WHERE kunnasta_pois_muuttopv IS NULL;
