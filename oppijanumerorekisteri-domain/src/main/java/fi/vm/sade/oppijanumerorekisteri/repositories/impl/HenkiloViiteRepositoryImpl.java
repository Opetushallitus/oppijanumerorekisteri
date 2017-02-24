package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.google.common.collect.Sets;
import com.querydsl.core.types.Projections;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepositoryCustom;
import org.springframework.util.CollectionUtils;

import static fi.vm.sade.oppijanumerorekisteri.models.QHenkiloViite.henkiloViite;
import static fi.vm.sade.oppijanumerorekisteri.models.QHenkilo.henkilo;

public class HenkiloViiteRepositoryImpl extends AbstractRepository implements HenkiloViiteRepositoryCustom {

    @Override
    public List<HenkiloViiteDto> findBy(HenkiloCriteria criteria) {
        List<HenkiloViiteDto> result;
        if(!CollectionUtils.isEmpty(criteria.getHenkiloOids())) {
            // Find master oids
            List<String> masters = jpa().select(henkiloViite.masterOid)
                    .from(henkiloViite)
                    .where(henkiloViite.masterOid.in(criteria.getHenkiloOids())
                            .or(henkiloViite.slaveOid.in(criteria.getHenkiloOids())))
                    .fetch();
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
