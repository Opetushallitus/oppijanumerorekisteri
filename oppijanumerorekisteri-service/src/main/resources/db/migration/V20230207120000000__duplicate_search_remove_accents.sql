--
-- KJHH-2272
--

-- Needed for stripping accents
CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent is NOT immutable so it shouldn't be used for column generation or indexing
-- this might be a bad idea...
CREATE OR REPLACE FUNCTION duplicate_search_fmt(TEXT) RETURNS TEXT AS
$$ SELECT lower(unaccent($1)); $$
LANGUAGE SQL IMMUTABLE;

-- declare this once for clarity
ALTER TABLE henkilo ADD COLUMN IF NOT EXISTS duplicate_search_str TEXT GENERATED ALWAYS AS
(duplicate_search_fmt(etunimet || ' ' || kutsumanimi || ' ' || sukunimi || ' ' || date_to_char(syntymaaika))) STORED;

-- re-create the index (note: GIN instead of GIST)
DROP INDEX IF EXISTS henkilo_name_similarity;
CREATE INDEX henkilo_name_similarity ON henkilo USING gin(duplicate_search_str gin_trgm_ops);
