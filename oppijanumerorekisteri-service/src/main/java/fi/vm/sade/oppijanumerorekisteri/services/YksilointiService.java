package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

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
     * Listaa palvelutunnisteet joilla yksilöinti on aktiivinen henkilölle.
     *
     * @param oid henkilö oid
     * @return palvelutunnisteet
     */
    Iterable<String> listPalvelutunnisteet(String oid);

    /**
     * Aktivoi yksilöinnin annetulle palvelutunnisteelle.
     *
     * @param oid henkilö oid
     * @param palvelutunniste palvelutunniste
     */
    void enableYksilointi(String oid, String palvelutunniste);

    /**
     * Kytkee yksilöinnin pois päältä annetulta palvelutunnisteelta
     *
     * @param oid henkilö oid
     * @param palvelutunniste palvelutunniste
     */
    void disableYksilointi(String oid, String palvelutunniste);

    /**
     * Aktivoi yksilöinnin annetulle hakemukselle.
     *
     * @param oid henkilö oid
     * @param dto hakemuksen tiedot
     */
    void enableYksilointi(String oid, AsiayhteysHakemusDto dto);

    /**
     * Aktivoi yksilöinnin käyttöoikeuden perusteella.
     *
     * @param oid henkilö oid
     * @param dto käyttöoikeuden tiedot
     */
    void enableYksilointi(String oid, AsiayhteysKayttooikeusDto dto);

}
