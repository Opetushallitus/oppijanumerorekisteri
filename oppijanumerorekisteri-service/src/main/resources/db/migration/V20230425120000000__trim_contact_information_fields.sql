--
-- KJHH-2143: Attempt to sanitize contact information fields
--
UPDATE yhteystiedot SET
    yhteystieto_arvo = TRIM(yhteystieto_arvo)
WHERE
    yhteystieto_arvo IS NOT NULL
    AND yhteystieto_arvo != ''
    AND (yhteystieto_arvo ~ '^ .*' OR yhteystieto_arvo ~ ' $');
