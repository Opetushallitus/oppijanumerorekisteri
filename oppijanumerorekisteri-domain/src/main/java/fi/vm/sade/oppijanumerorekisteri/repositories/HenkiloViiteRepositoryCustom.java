package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;

import java.util.List;

public interface HenkiloViiteRepositoryCustom {
    List<HenkiloViiteDto> findBy(HenkiloCriteria criteria);
}
