package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.transform.AliasToBeanResultTransformer;
import org.hibernate.type.StringType;

import java.util.List;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepositoryCustom;

public class HenkiloViiteRepositoryImpl extends AbstractRepository implements HenkiloViiteRepositoryCustom {

    @Override
    public List<HenkiloViiteDto> findBy(HenkiloCriteria criteria) {
        // With QueryDSL's JPA version, we can't make unions :/
        Where where = buildSqlConditions(criteria, "h");
        SQLQuery query = where.apply(em.unwrap(Session.class)
                .createSQLQuery("WITH relations AS (\n" +
                        "  -- Select the \"main\" viite to matching henkilo (to any direction)\n" +
                        "  SELECT DISTINCT v.master_oid as \"masterOid\",\n" +
                        "         v.slave_oid as \"slaveOid\"\n" +
                        "  FROM henkilo h INNER JOIN henkiloviite v ON v.master_oid = h.oidhenkilo\n" +
                        "                                              OR v.slave_oid = h.oidhenkilo\n" +
                        "      " + where + "\n" +
                        "  -- Union with all other viittees with the same master than previous (needed given that the henkilo given matched to slave):\n" +
                        "  UNION SELECT DISTINCT v2.master_oid as \"masterOid\",\n" +
                        "               v2.slave_oid as \"slaveOid\"\n" +
                        "        FROM henkilo h INNER JOIN henkiloviite v ON v.master_oid = h.oidhenkilo\n" +
                        "                                                    OR v.slave_oid = h.oidhenkilo\n" +
                        "        INNER JOIN henkiloviite v2 ON v2.master_oid = v.master_oid AND v2.slave_oid != v.slave_oid\n" +
                        "        " + where + "\n" +
                        ") SELECT r.\"masterOid\" as \"masterOid\",\n" +
                        "         r.\"slaveOid\" as \"slaveOid\"\n" +
                        "  -- Lastly inner join to henkilös to make sure they exists (otherwise missing foreign key references make \n" +
                        "  -- it possible for the result to contain references non existing henkilos)\n" +
                        "  FROM relations r INNER JOIN henkilo hm ON r.\"masterOid\" = hm.oidhenkilo\n" +
                        "    INNER JOIN henkilo hs ON r.\"slaveOid\" = hs.oidhenkilo;\n" +
                        "ORDER BY \"masterOid\", \"slaveOid\";"));
        query.setResultTransformer(new AliasToBeanResultTransformer(HenkiloViiteDto.class));
        return (List<HenkiloViiteDto>) query.list();
    }
    
    private Where buildSqlConditions(HenkiloCriteria criteria, String h) {
        Where where = new Where();
        if (criteria.getHenkiloOids() != null) {
            if (criteria.getHenkiloOids().isEmpty()) {
                where.conditions.add("FALSE"); // ok in native queries
            } else {
                where.conditions.add(h+".oidhenkilo in (:oids)");
                where.parameterSetters.add(q -> q.setParameterList("oids", criteria.getHenkiloOids(), StringType.INSTANCE));
            }
        }
        return where;
    }
}
