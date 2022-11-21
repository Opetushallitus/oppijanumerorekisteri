--
-- View for easily query data for tuontikooste (KJHH-2219)
--
CREATE OR REPLACE VIEW tuontikooste AS
SELECT
    tmp.*,
    tmp.total - tmp.successful AS failures
FROM (
SELECT
    t.id,
    t.kasittelija_oid AS oid,
    h2.sukunimi || ', ' || h2.etunimet AS author,
    t.aikaleima AS timestamp,
    org.oid AS org,
    count(tr.henkilo_id) AS total,
    sum(CASE WHEN h.passivoitu OR h.duplicate OR h.yksiloity OR h.yksiloityvtj THEN 1 ELSE 0 END) AS successful
FROM
    tuonti t
    JOIN tuonti_organisaatio torg ON t.id = torg.tuonti_id
    JOIN organisaatio org ON org.id = torg.organisaatio_id
    JOIN tuonti_rivi tr ON t.id = tr.tuonti_id
    LEFT JOIN henkilo h ON tr.henkilo_id = h.id
    LEFT JOIN henkilo h2 ON t.kasittelija_oid = h2.oidhenkilo
GROUP BY
    t.id,
    oid,
    author,
    timestamp,
    org.oid) tmp;
