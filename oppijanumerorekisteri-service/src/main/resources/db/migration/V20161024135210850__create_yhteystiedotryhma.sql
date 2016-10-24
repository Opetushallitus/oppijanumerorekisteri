CREATE TABLE yhteystiedotryhma IF NOT EXISTS public.yhteystiedotryhma (
  henkilo_id BIGINT REFERENCES henkilo(id),
  ryhmakuvaus TEXT,
  ryhma_alkuperatieto TEXT,
  read_only BOOLEAN NOT NULL,
  id BIGINT NOT NULL PRIMARY KEY,
  version BIGINT NOT NULL DEFAULT 0
);