package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface YksilointiService {

    Optional<Henkilo> yksiloiAutomaattisesti(String henkiloOid);

    Henkilo yksiloiManuaalisesti(final String henkiloOid);

    /**
     * Päivittään yksilöidyn henkilön tiedot VTJ:stä.
     *
     * @param henkiloOid henkilö oid
     */
    void paivitaYksilointitiedot(String henkiloOid);

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
}
