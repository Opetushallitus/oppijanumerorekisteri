package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// High speed repository for jpa queries with querydsl.
@Repository
public interface HenkiloHibernateRepository {
    Optional<String> findHetuByOid(String henkiloOid);

    Optional<String> findOidByHetu(String hetu);

    List<Henkilo> findHenkiloOidHetuNimisByEtunimetOrSukunimi(List<String> etunimet, String sukunimi);

    List<YhteystietoHakuDto> findYhteystiedot(YhteystietoCriteria criteria);

    List<Henkilo> findHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit);
}
