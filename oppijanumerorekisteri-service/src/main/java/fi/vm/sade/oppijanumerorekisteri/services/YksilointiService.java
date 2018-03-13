package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.AsiayhteysHakemusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.Page;
import fi.vm.sade.oppijanumerorekisteri.dto.YksilointitietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YksilointiVertailuDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

import java.util.Optional;

public interface YksilointiService {

    Optional<Henkilo> yksiloiAutomaattisesti(String henkiloOid);

    Henkilo yksiloiManuaalisesti(final String henkiloOid);

    Henkilo hetuttomanYksilointi(String henkiloOid);

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
     * @param henkiloOid
     * @return YksilointitietoDto
     */
    YksilointitietoDto getYksilointiTiedot(String henkiloOid);

    /*
     * Yliajaa henkilön tiedot VTJ:n tiedoilla.
     *
     * @param henkiloOid
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

}
