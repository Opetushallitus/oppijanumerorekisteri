CREATE TABLE kielitutkintotodistuspdf (
    id uuid PRIMARY KEY,
    tiedote_id uuid NOT NULL REFERENCES tiedote(id),
    content bytea NOT NULL,
    created timestamp with time zone NOT NULL DEFAULT current_timestamp,
    updated timestamp with time zone NOT NULL DEFAULT current_timestamp
);
