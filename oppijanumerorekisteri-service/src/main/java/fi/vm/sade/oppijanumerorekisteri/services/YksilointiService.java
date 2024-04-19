package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

import java.util.Optional;

public interface YksilointiService {

    /**
     * Automaattisen massayksilöintiprosessin käynnistämä yksilöinti. Ohittaa henkilöt joita ei löydy.
     * @param henkiloOid Henkilön oid
     */
    void yksiloiAutomaattisesti(String henkiloOid);

    /**
     * Tallentaa henkilön yksilöintiprosessissa tulleen virheen.
     * @param henkiloOid Henkilön oid
     * @param exception Yksilöintiprosessin virhe
     */
    void tallennaYksilointivirhe(String henkiloOid, Exception exception);

    /**
     * Käsin käynnistetty yksilöinti. Yleensä virkailija yliajaa henkilön tiedot tämän avulla. Olettaa oidia vastaavan
     * henkilön löytymistä.
     * @param henkiloOid Henkilön oid
     * @return Yksilöity henkilö
     */
    Henkilo yksiloiManuaalisesti(final String henkiloOid);

    /**
     * Virkailijan käynnistämä hetuttoman henkilön yksilöinti.
     * @param henkiloOid Henkilön oid
     * @return Yksilöity henkilö
     */
    Henkilo hetuttomanYksilointi(String henkiloOid);

    /**
     * Check if two stings can be considered similar
     * @param a string to compare
     * @param b string to compare
     * @return boolean indicating whether strings can be considered similar
     */
    boolean isSimilar(String a, String b);
    boolean namesMatch(
            String givenEtunimet, String givenSukunimi,
            String expectedEtunimet, String expectedSukunimi
    );

    /**
     * Purkaa virkailijan käsin yksilöimän henkilön yksilöinnin
     * @param henkiloOid Henkilön oid
     * @return Yksilöimätön henkilö
     */
    Henkilo puraHeikkoYksilointi(final String henkiloOid);

    /**
     * Päivittään yksilöidyn henkilön tiedot VTJ:stä.
     *
     * @param henkiloOid henkilö oid
     */
    void paivitaYksilointitiedot(String henkiloOid);

    /**
     * Hakee henkilon yksilointitiedot oidin perusteella
     *
     * @param henkiloOid Henkilön oid
     * @return YksilointitietoDto
     */
    YksilointitietoDto getYksilointiTiedot(String henkiloOid);

    /**
     * Yliajaa henkilön tiedot VTJ:n tiedoilla.
     *
     * @param henkiloOid Henkilön oid
     */
    void yliajaHenkilonTiedot(String henkiloOid);

    /**
     * Palauttaa epäonnistuneet yksilöinnit.
     *
     * @param page sivunumero
     * @param count sivun koko
     * @return yksilöintitiedot
     */
    Page<YksilointiVertailuDto> listEpaonnistunutYksilointi(int page, int count);

    /**
     * Tarkista löytyykö annetulla hetulla henkilö
     * 1. oppijanumerorekisteristä
     * 2. vtj:stä
     *
     * Mikäli löytyy, tarkistetaan että muut tiedot ovat oikein.
     *
     * @param details hetu sekä nimitiedot
     * @return oppijanumero mikäli henkilö löytyy
     * @throws RuntimeException poikkeustapaukset välitetään tyypitetyin poikkeuksin
     */
    Optional<String> exists(HenkiloExistenceCheckDto details);
}
