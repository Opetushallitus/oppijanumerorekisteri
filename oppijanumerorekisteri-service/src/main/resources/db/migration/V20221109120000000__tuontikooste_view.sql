--
-- View for easily query data for tuontikooste (KJHH-2219)
--
CREATE OR REPLACE VIEW tuontikooste AS SELECT
    t.id,
    t.kasittelija_oid AS kayttaja,
    t.aikaleima,
    org.oid AS org,
    count(tr.henkilo_id) AS total,
    sum(CASE WHEN h.passivoitu OR h.duplicate OR h.yksiloity OR h.yksiloityvtj THEN 1 ELSE 0 END) AS successful
FROM
    tuonti t
    JOIN tuonti_organisaatio torg ON t.id = torg.tuonti_id
    JOIN organisaatio org ON org.id = torg.organisaatio_id
    JOIN tuonti_rivi tr ON t.id = tr.tuonti_id
    LEFT JOIN henkilo h ON tr.henkilo_id = h.id
GROUP BY
    t.id,
    t.kasittelija_oid,
    t.aikaleima,
    org.oid;
