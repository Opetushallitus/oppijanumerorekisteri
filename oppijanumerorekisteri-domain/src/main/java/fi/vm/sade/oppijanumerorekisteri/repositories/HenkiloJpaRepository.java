package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijanumerorekisteriCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.sort.OppijaTuontiSort;
import org.joda.time.DateTime;

import java.time.LocalDate;
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

    Optional<String> findOidByKaikkiHetut(String hetu);

    List<YhteystietoHakuDto> findYhteystiedot(YhteystietoCriteria criteria);

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

    /**
     * Hakee ensimmäisen tunnisteeseen liitetyn henkilön
     * @param identification Tunnisteen tiedot
     * @return Ensimmäinen henkilö johon tunniste on liitetty
     */
    Optional<Henkilo> findByIdentification(IdentificationDto identification);

    /**
     * Hakee tunnisteeseen liitetyn henkilön
     * @param oidHenkilo Tunnisteen liitetyn henkilön oid
     * @param identification Tunnisteen tiedot
     * @return Henkilö johon tunniste on liitetty
     */
    Optional<Henkilo> findByIdentification(String oidHenkilo, IdentificationDto identification);

    Collection<Henkilo> findByIdentifications(Collection<IdentificationDto> identifications);

    Optional<HenkiloOidHetuNimiDto> findOidHetuNimiByHetu(String hetu);

    Optional<HenkiloOidHetuNimiDto> findOidHetuNimiByKaikkiHetut(String hetu);

    List<Henkilo> findSlavesByMasterOid(String henkiloOid);

    int findDuplikaatitCount(HenkiloDuplikaattiCriteria criteria, String masterOid);

    List<Henkilo> findDuplikaatit(HenkiloDuplikaattiCriteria criteria);

    Collection<Henkilo> findUnidentified(long limit, long offset);

    Iterable<String> findOidByYhteystieto(String arvo);

    Iterable<String> findPassinumerotByOid(String oid);

    Map<String, Henkilo> findAndMapByKaikkiHetut(Set<String> hetut);

    Map<String, Henkilo> findAndMapByPassinumerot(Set<String> passinumerot);

    Map<String, Henkilo> findAndMapByIdentifiers(IdpEntityId idpEntityId, Set<String> identifiers);

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

    /**
     * Etsii henkilön kaikista hetuista.
     *
     * @param hetu henkilötunnus, jolla etsitään
     * @return hetulla löytynyt henkilö, tai tyhjä
     */
    Optional<Henkilo> findByKaikkiHetut(String hetu);

    List<HenkiloMunicipalDobDto> findByMunicipalAndBirthdate(String municipal, LocalDate dob, long limit, long offset);

    Collection<Henkilo> findDeadWithIncompleteCleanup(CleanupStep step);

    List<String> findHetusInVtjBucket(long bucketId);

    List<String> findHetusWithoutVtjBucket();

    List<KotikuntaHistoria> findKotikuntaHistorias(List<String> oids);

    List<KotikuntaHistoria> findTurvakieltoKotikuntaHistorias(List<String> oids);
}
