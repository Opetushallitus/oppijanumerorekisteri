package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import org.joda.time.DateTime;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// High speed repository for jpa queries with querydsl.
@Repository
public interface HenkiloJpaRepository {
    Optional<String> findHetuByOid(String henkiloOid);

    Optional<String> findOidByHetu(String hetu);

    List<Henkilo> findHenkiloOidHetuNimisByEtunimetOrSukunimi(List<String> etunimet, String sukunimi);

    List<YhteystietoHakuDto> findYhteystiedot(YhteystietoCriteria criteria);

    List<Henkilo> findHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit);

    List<HenkiloPerustietoDto> findByOidIn(List<String> oidList);

    /**
     * Palauttaa henkilön master datan
     * {@link fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite#slaveOid}:n
     * perusteella (jos sellainen löytyy).
     *
     * @param henkiloOid henkilö oid
     * @return henkilo optional
     */
    Optional<Henkilo> findMasterBySlaveOid(String henkiloOid);

    List<String> findOidsModifiedSince(HenkiloCriteria criteria, DateTime modifiedSince);

    Optional<Henkilo> findByExternalId(String externalId);

}
