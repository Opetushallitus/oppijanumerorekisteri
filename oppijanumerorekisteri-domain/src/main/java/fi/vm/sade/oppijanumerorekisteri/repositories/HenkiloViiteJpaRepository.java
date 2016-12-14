package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloViiteDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HenkiloViiteJpaRepository {
    List<HenkiloViiteDto> findBy(HenkiloCriteria criteria);
}
