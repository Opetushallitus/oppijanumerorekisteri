CREATE TABLE eidastunniste
(
    id bigint PRIMARY KEY,
    version bigint NOT NULL,
    henkilo_id bigint NOT NULL REFERENCES henkilo(id),
    tunniste text NOT NULL,
    createdby text NOT NULL,
    created timestamp with time zone NOT NULL DEFAULT current_timestamp,
    UNIQUE (tunniste)
);

CREATE INDEX eidastunniste_henkilo_id_idx ON eidastunniste(henkilo_id);
CREATE INDEX eidastunniste_tunniste_idx ON eidastunniste(tunniste);