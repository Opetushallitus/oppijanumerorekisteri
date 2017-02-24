package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.core.types.Projections;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import java.util.List;

import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepositoryCustom;
import org.springframework.util.CollectionUtils;

import static fi.vm.sade.oppijanumerorekisteri.models.QHenkiloViite.henkiloViite;

public class HenkiloViiteRepositoryImpl extends AbstractRepository implements HenkiloViiteRepositoryCustom {

    @Override
    public List<HenkiloViiteDto> findBy(HenkiloCriteria criteria) {
        if(!CollectionUtils.isEmpty(criteria.getHenkiloOids())) {
            // Find master oids
            List<String> masters = jpa().select(henkiloViite.masterOid)
                    .from(henkiloViite)
                    .where(henkiloViite.masterOid.in(criteria.getHenkiloOids())
                            .or(henkiloViite.slaveOid.in(criteria.getHenkiloOids())))
                    .fetch();
            // Find all slaves for the master oids
            return jpa().select(Projections.bean(HenkiloViiteDto.class,
                    henkiloViite.masterOid.as("masterOid"),
                    henkiloViite.slaveOid.as("henkiloOid")))
                    .from(henkiloViite)
                    .where(henkiloViite.masterOid.in(masters))
                    .fetch();
        }
        else {
            // Find all
            return jpa().select(Projections.bean(HenkiloViiteDto.class,
                    henkiloViite.masterOid.as("masterOid"),
                    henkiloViite.slaveOid.as("henkiloOid")))
                    .from(henkiloViite)
                    .fetch();
        }
    }
}
