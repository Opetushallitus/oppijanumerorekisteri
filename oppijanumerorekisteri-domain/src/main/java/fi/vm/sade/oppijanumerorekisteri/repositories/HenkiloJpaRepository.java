package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijanumerorekisteriCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import java.util.Collection;
import org.joda.time.DateTime;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

// High speed repository for jpa queries with querydsl.
@Repository
public interface HenkiloJpaRepository {

    /**
     * Yleiskäyttöinen henkilöhaku ilman sivutusta.
     *
     * @param criteria hakukriteerit
     * @return henkilot
     */
    List<HenkiloHakuDto> findBy(OppijanumerorekisteriCriteria criteria);

    /**
     * Yleiskäyttöinen henkilöhaku.
     *
     * @param criteria hakukriteerit
     * @param limit alkioiden maksimimäärä
     * @param offset sivutuksen offset
     * @return henkilot
     */
    List<HenkiloHakuDto> findBy(OppijanumerorekisteriCriteria criteria, Long limit, Long offset);

    /**
     * Hakee annettujen hakukriteerien mukaiset henkilöiden OID:t.
     *
     * @param criteria hakukriteerit
     * @return henkilö OID:t
     */
    Set<String> findOidsBy(OppijaTuontiCriteria criteria);

    /**
     * Yleiskäyttöinen henkilöhaku.
     *
     * @param criteria hakukriteerit
     * @param limit alkioiden maksimimäärä
     * @param offset sivutuksen offset
     * @return henkilot
     */
//    List<HenkiloHakuDto> findBy(OppijaCriteria criteria, long limit, long offset);

    List<HenkiloHakuPerustietoDto> findPerustietoBy(OppijanumerorekisteriCriteria criteria, Long limit, Long offset);

    /**
     * Henkilöiden perustietojen ja yhteystietojen hakutoiminto. Henkilöllä voi
     * olla useita yhteystietoja, joten tämä metodi palauttaa henkilön tiedot
     * jokaista yhteystietoa kohti.
     *
     * @param criteria hakukriteerit
     * @return henkilot ja yhteystiedot
     */
    List<HenkiloYhteystietoDto> findWithYhteystiedotBy(HenkiloCriteria criteria);

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

    List<String> findOidsModifiedSince(HenkiloCriteria criteria, DateTime modifiedSince, Integer offset, Integer amount);

    Optional<Henkilo> findByExternalId(String externalId);

    Collection<Henkilo> findByExternalIds(Collection<String> externalIds);

    Optional<Henkilo> findByIdentification(IdentificationDto identification);

    Collection<Henkilo> findByIdentifications(Collection<IdentificationDto> identifications);

    Optional<HenkiloOidHetuNimiDto> findOidHetuNimiByHetu(String hetu);

    List<Henkilo> findSlavesByMasterOid(String henkiloOid);

    List<Henkilo> findDuplicates(Henkilo henkilo);

    Collection<Henkilo> findUnidentified(long limit, long offset);

    Iterable<String> findOidByYhteystieto(String arvo);

    Map<String, Henkilo> findAndMapByPassinumerot(Set<String> passinumerot);

}
