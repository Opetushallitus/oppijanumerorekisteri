--
-- KJHH-2298: Add schema definition to unaccent invocation to be able
-- to restore database from dump.
--
CREATE OR REPLACE FUNCTION duplicate_search_fmt(TEXT) RETURNS TEXT AS
$$ SELECT lower(public.unaccent($1)); $$
LANGUAGE SQL IMMUTABLE;
