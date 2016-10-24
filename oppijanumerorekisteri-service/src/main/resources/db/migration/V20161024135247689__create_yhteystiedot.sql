CREATE TABLE yhteystiedot IF NOT EXISTS public.yhteystiedot (
  yhteystiedotryhma_id BIGINT REFERENCES yhteystiedotryhma(id) NOT NULL,
  yhteystieto_tyyppi TEXT,
  yhteystieto_arvo TEXT,
  id BIGINT NOT NULL PRIMARY KEY,
  version BIGINT NOT NULL DEFAULT 0
);