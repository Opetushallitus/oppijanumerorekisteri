package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.google.common.collect.Sets;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepositoryCustom;
import org.hibernate.Session;
import org.springframework.util.CollectionUtils;

import static fi.vm.sade.oppijanumerorekisteri.models.QHenkiloViite.henkiloViite;
import static fi.vm.sade.oppijanumerorekisteri.models.QHenkilo.henkilo;

public class HenkiloViiteRepositoryImpl extends AbstractRepository implements HenkiloViiteRepositoryCustom {

    final long postgreSqlMaxQuerySize = 20000;

    @Override
    public List<HenkiloViiteDto> findBy(HenkiloCriteria criteria) {
        List<HenkiloViiteDto> result;
        if(!CollectionUtils.isEmpty(criteria.getHenkiloOids())) {
            // Find master oids
            List<String> masters;
            // For large queries. This allows postgres to benefit from indices.
            if(criteria.getHenkiloOids().size() >= 80) {
                List<String> queryOids = criteria.getHenkiloOids().stream().filter(s -> s.matches("^(\\.|\\d)*$")).collect(Collectors.toList());
                masters = em.unwrap(Session.class).createSQLQuery("SELECT hv.master_oid \n" +
                        "FROM henkiloviite hv \n" +
                        "  INNER JOIN (\n" +
                        "    SELECT '" + queryOids.get(0) + "' as query_oid\n" +
                        queryOids.subList(1, queryOids.size()).stream().map(s -> "    UNION ALL SELECT '" + s + "'\n").collect(Collectors.joining())  +
                        "  ) as hv_tmp on hv.master_oid = hv_tmp.query_oid OR hv.slave_oid = hv_tmp.query_oid\n").list();
            }
            else {
                masters = jpa().select(henkiloViite.masterOid.as("masterOid"))
                        .from(henkiloViite)
                        .where(henkiloViite.masterOid.in(criteria.getHenkiloOids())
                                .or(henkiloViite.slaveOid.in(criteria.getHenkiloOids())))
                        .fetch();
            }

            // Find all slaves for the master oids
            result = jpa().select(Projections.bean(HenkiloViiteDto.class,
                    henkiloViite.masterOid.as("masterOid"),
                    henkiloViite.slaveOid.as("henkiloOid")))
                    .from(henkiloViite)
                    .where(henkiloViite.masterOid.in(masters))
                    .fetch();
        }
        else {
            // Find all
            result = jpa().select(Projections.bean(HenkiloViiteDto.class,
                    henkiloViite.masterOid.as("masterOid"),
                    henkiloViite.slaveOid.as("henkiloOid")))
                    .from(henkiloViite)
                    .fetch();
        }


        JPAQuery<String> query = jpa().select(henkilo.oidHenkilo)
                .from(henkilo)
                .where(henkilo.oidHenkilo.in(result.stream().flatMap(henkiloViiteDto ->
                        Stream.of(henkiloViiteDto.getHenkiloOid(), henkiloViiteDto.getMasterOid())).collect(Collectors.toSet())));

        query.limit(postgreSqlMaxQuerySize);
        query.offset(0);

        List<String> existingHenkilos = query.fetch();

        int resultsize = existingHenkilos.size();
        int index = 1;

        while(resultsize == postgreSqlMaxQuerySize){

            query.offset(postgreSqlMaxQuerySize * index);

            List<String> batchExistingHenkilos = query.fetch();
            existingHenkilos.addAll(batchExistingHenkilos);

            resultsize = batchExistingHenkilos.size();

            index++;
        }

        return result.stream().filter(henkiloViiteDto ->
                existingHenkilos.containsAll(Sets.newHashSet(henkiloViiteDto.getHenkiloOid(), henkiloViiteDto.getMasterOid())))
                .collect(Collectors.toList());
    }

    @Override
    public void removeByMasterOidAndSlaveOid(String masterOid, String slaveOid) {
        QHenkiloViite qViite = QHenkiloViite.henkiloViite;
        jpa()
            .delete(qViite)
            .where(qViite.masterOid.eq(masterOid).and(qViite.slaveOid.eq(slaveOid)))
                .execute();
    }
}
