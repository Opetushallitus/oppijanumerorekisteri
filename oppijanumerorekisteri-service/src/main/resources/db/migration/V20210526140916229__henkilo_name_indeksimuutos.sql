DROP FUNCTION IF EXISTS date_to_char(date);
CREATE FUNCTION date_to_char(date) RETURNS text AS
$$ select coalesce(to_char($1, 'YYYY-MM-DD'), ''); $$
LANGUAGE sql immutable;

DROP INDEX IF EXISTS henkilo_name_similarity;
CREATE INDEX henkilo_name_similarity ON public.henkilo USING gist ((((((((etunimet)::text || ' '::text) || (kutsumanimi)::text) || ' '::text) || (sukunimi)::text) || ' '::text) || date_to_char(syntymaaika)) public.gist_trgm_ops);
