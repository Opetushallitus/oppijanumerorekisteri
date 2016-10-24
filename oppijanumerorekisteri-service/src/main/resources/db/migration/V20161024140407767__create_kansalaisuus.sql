CREATE TABLE kansalaisuus IF NOT EXISTS public.kansalaisuus (
  kansalaisuuskoodi TEXT NOT NULL UNIQUE,
  id BIGINT NOT NULL PRIMARY KEY,
  version BIGINT NOT NULL DEFAULT 0
);