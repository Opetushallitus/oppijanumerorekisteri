--
-- Adjust tuontikooste view to show failed attempts(KJHH-2242)
-- Tuonti rivit might not have been initialized - use left join
-- Read total from tuonti instead of counting
-- Bring in new column tuonti.kasiteltyja to deduct the state of particular tuonti (in_progress)
--
DROP VIEW tuontikooste;
CREATE OR REPLACE VIEW tuontikooste AS
SELECT
    tmp.*,
    tmp.total - tmp.successful AS failures,
    tmp.total - tmp.done AS inProgress
FROM (
SELECT
    t.id,
    t.kasittelija_oid AS oid,
    h2.sukunimi || ', ' || h2.etunimet AS author,
    t.aikaleima AS timestamp,
    org.oid AS org,
    t.kasiteltavia AS total,
    t.kasiteltyja AS done,
    sum(CASE WHEN h.passivoitu OR h.duplicate OR h.yksiloity OR h.yksiloityvtj THEN 1 ELSE 0 END) AS successful,
    sum(CASE WHEN tr.conflict THEN 1 ELSE 0 END) as conflicts
FROM
    tuonti t
    JOIN tuonti_organisaatio torg ON t.id = torg.tuonti_id
    JOIN organisaatio org ON org.id = torg.organisaatio_id
    LEFT JOIN tuonti_rivi tr ON t.id = tr.tuonti_id
    LEFT JOIN henkilo h ON tr.henkilo_id = h.id
    LEFT JOIN henkilo h2 ON t.kasittelija_oid = h2.oidhenkilo
GROUP BY
    t.id,
    oid,
    author,
    timestamp,
    org.oid) tmp;
