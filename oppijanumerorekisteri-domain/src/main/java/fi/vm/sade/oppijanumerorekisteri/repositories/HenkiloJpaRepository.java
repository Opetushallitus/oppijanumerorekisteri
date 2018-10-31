package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijanumerorekisteriCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.sort.OppijaTuontiSort;
import org.joda.time.DateTime;

import java.util.*;

// High speed repository for jpa queries with querydsl.
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
     * Hakee annettujen hakukriteerien mukaiset henkilöt.
     *
     * @param criteria hakukriteerit
     * @param limit alkioiden maksimimäärä
     * @param offset sivutuksen offset
     * @param sort järjestys
     * @return henkilöt
     */
    List<Henkilo> findBy(OppijaTuontiCriteria criteria, int limit, int offset, OppijaTuontiSort sort);

    /**
     * Laskee annettujen hakukriteerien mukaiset henkilöt.
     *
     * @param criteria hakukriteerit
     * @return henkilöiden lukumäärä
     */
    long countBy(OppijaTuontiCriteria criteria);

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

    Optional<String> findOidByYksiloityHetu(String hetu);

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

    /**
     * Palauttaa henkilöiden master-tiedot. Paluuarvon avain on slaveOid.
     *
     * @param henkiloOids henkilö oidit
     * @return henkilöt
     */
    Map<String, Henkilo> findMastersBySlaveOids(Set<String> henkiloOids);

    Map<String, Henkilo> findMastersByOids(Set<String> henkiloOids);

    List<String> findOidsModifiedSince(HenkiloCriteria criteria, DateTime modifiedSince, Integer offset, Integer amount);

    Optional<Henkilo> findByExternalId(String externalId);

    Collection<Henkilo> findByExternalIds(Collection<String> externalIds);

    Optional<Henkilo> findByIdentification(IdentificationDto identification);

    Collection<Henkilo> findByIdentifications(Collection<IdentificationDto> identifications);

    Optional<HenkiloOidHetuNimiDto> findOidHetuNimiByHetu(String hetu);

    Optional<HenkiloOidHetuNimiDto> findOidHetuNimiByYksiloityHetu(String hetu);

    List<Henkilo> findSlavesByMasterOid(String henkiloOid);

    List<Henkilo> findDuplikaatit(HenkiloDuplikaattiCriteria criteria);

    Collection<Henkilo> findUnidentified(long limit, long offset);

    Iterable<String> findOidByYhteystieto(String arvo);

    Iterable<String> findPassinumerotByOid(String oid);

    Map<String, Henkilo> findAndMapByYksiloityHetu(Set<String> hetut);

    Map<String, Henkilo> findAndMapByPassinumerot(Set<String> passinumerot);

    Map<String, Henkilo> findAndMapByIdentifiers(String idpEntityId, Set<String> identifiers);

    /**
     * Palauttaa yksilöityjen henkilöiden lukumäärän. Yksilöidyksi lasketaan
     * sekä manuaalisesti yksilöidyt hetuttomat että automaattisesti yksilöidyt
     * hetulliset henkilöt ja passivoidut.
     *
     * @see YksilointiTila#OK
     * @param criteria hakukriteerit
     * @return onnistuneiden lukumäärä
     */
    long countByYksilointiOnnistuneet(OppijaTuontiCriteria criteria);

    /**
     * Palauttaa yksilöinnin virheellisten henkilöiden lukumäärän. Virheellisiä
     * ovat yksilöimättömät hetuttomat henkilöt sekä ne yksilöimättömät
     * hetulliset henkilöt joille {@link Henkilo#yksilointiYritetty} on
     * <code>true</code>.
     *
     * @see YksilointiTila#HETU_PUUTTUU
     * @see YksilointiTila#VIRHE
     * @param criteria hakukriteerit
     * @return virheellisten lukumäärä
     */
    long countByYksilointiVirheet(OppijaTuontiCriteria criteria);

    /**
     * Palauttaa yksilöinnin keskeneräisten henkilöiden lukumäärän.
     * Keskeneräisiä ovat hetulliset henkilöt joita ei ole vielä yksilöity ja
     * {@link Henkilo#yksilointiYritetty} on <code>false</code>.
     *
     * @see YksilointiTila#KESKEN
     * @param criteria hakukriteerit
     * @return keskeneräisten lukumäärä
     */
    long countByYksilointiKeskeneraiset(OppijaTuontiCriteria criteria);

    List<HenkiloPerustietoDto> findPerustiedotByHetuIn(List<String> hetut);
}
