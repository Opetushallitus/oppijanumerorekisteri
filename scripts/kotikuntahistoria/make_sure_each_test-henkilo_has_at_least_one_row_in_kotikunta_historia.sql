WITH parsed AS (
  SELECT
    h.id,
    h.kotikunta,
    h.hetu,
    SUBSTRING(h.hetu FROM 1 FOR 6) AS short_date,
    SUBSTRING(h.hetu FROM 7 FOR 1) AS välimerkki
  FROM henkilo h
  WHERE (
    h.oidhenkilo LIKE '1.2.246.562.98.%' OR
    h.oidhenkilo LIKE '1.2.246.562.198.%' OR
    h.oidhenkilo LIKE '1.2.246.562.298.%'
  )
  AND h.hetu IS NOT NULL
  AND h.kotikunta IS NOT NULL
  AND h.turvakielto = false
  AND NOT EXISTS (
    SELECT 1
    FROM kotikunta_historia k
    WHERE k.henkilo_id = h.id
  )
),
with_vuosisata AS (
  SELECT *,
    CASE välimerkki
      WHEN '+' THEN 1800
      WHEN '-' THEN 1900
      WHEN 'Y' THEN 1900
      WHEN 'X' THEN 1900
      WHEN 'W' THEN 1900
      WHEN 'V' THEN 1900
      WHEN 'U' THEN 1900
      WHEN 'A' THEN 2000
      WHEN 'B' THEN 2000
      WHEN 'C' THEN 2000
      WHEN 'D' THEN 2000
      WHEN 'E' THEN 2000
      WHEN 'F' THEN 2000
      ELSE NULL
    END AS vuosisata
  FROM parsed
)
INSERT INTO kotikunta_historia (
  id,
  version,
  henkilo_id,
  kotikunta,
  kuntaan_muuttopv
) 
SELECT
  nextval('hibernate_sequence'), 
  0,
  id,
  kotikunta,
  TO_DATE(
    SUBSTRING(short_date FROM 1 FOR 2) || '.' ||
    SUBSTRING(short_date FROM 3 FOR 2) || '.' ||
    (vuosisata + CAST(SUBSTRING(short_date FROM 5 FOR 2) AS INTEGER)),
    'DD.MM.YYYY'
  )
FROM with_vuosisata
WHERE välimerkki IS NOT NULL;

COMMIT;
