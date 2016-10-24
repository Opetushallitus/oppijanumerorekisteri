CREATE TABLE kielisyys IF NOT EXISTS public.kielisyys (
  kielikoodi TEXT NOT NULL UNIQUE,
  kielityyppi TEXT,
  id BIGINT NOT NULL PRIMARY KEY,
  version BIGINT NOT NULL DEFAULT 0
);