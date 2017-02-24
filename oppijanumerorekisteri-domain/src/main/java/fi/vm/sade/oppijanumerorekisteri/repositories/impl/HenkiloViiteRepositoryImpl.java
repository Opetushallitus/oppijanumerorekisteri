package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.google.common.collect.Sets;
import com.querydsl.core.types.Projections;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepositoryCustom;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.transform.AliasToBeanConstructorResultTransformer;
import org.hibernate.type.StringType;
import org.springframework.util.CollectionUtils;

import static fi.vm.sade.oppijanumerorekisteri.models.QHenkiloViite.henkiloViite;
import static fi.vm.sade.oppijanumerorekisteri.models.QHenkilo.henkilo;

public class HenkiloViiteRepositoryImpl extends AbstractRepository implements HenkiloViiteRepositoryCustom {

    @Override
    public List<HenkiloViiteDto> findBy(HenkiloCriteria criteria) {
        List<HenkiloViiteDto> result;
        if(!CollectionUtils.isEmpty(criteria.getHenkiloOids())) {
            // Find master oids
            Where where = new Where();
//            where.conditions.add("hv.master_oid in (VALUES :oids) OR hv.slave_oid in (VALUES :oids)");
//            where.parameterSetters.add(q -> q.setParameterList("oids", criteria.getHenkiloOids(), StringType.INSTANCE));
            List<String> masters = where.apply(em.unwrap(Session.class).createSQLQuery("SELECT hv.master_oid \n" +
                    "FROM henkiloviite hv \n" +
//                    "" + where + "\n")).list();
                    "WHERE hv.master_oid IN (VALUES" + criteria.getHenkiloOids().stream().map(s -> "('"+s+"')").collect(Collectors.joining(",")) + ")\n" +
                    "OR hv.slave_oid IN (VALUES" + criteria.getHenkiloOids().stream().map(s -> "('" + s + "')").collect(Collectors.joining(",")) + ")\n")).list();

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

        // Make sure all henkilos exist
        List<String> existingHenkilos = jpa().select(henkilo.oidHenkilo)
                .from(henkilo)
                .where(henkilo.oidHenkilo.in(result.stream().flatMap(henkiloViiteDto ->
                        Stream.of(henkiloViiteDto.getHenkiloOid(), henkiloViiteDto.getMasterOid())).collect(Collectors.toSet())))
                .fetch();

        return result.stream().filter(henkiloViiteDto ->
                existingHenkilos.containsAll(Sets.newHashSet(henkiloViiteDto.getHenkiloOid(), henkiloViiteDto.getMasterOid())))
                .collect(Collectors.toList());
    }
}
