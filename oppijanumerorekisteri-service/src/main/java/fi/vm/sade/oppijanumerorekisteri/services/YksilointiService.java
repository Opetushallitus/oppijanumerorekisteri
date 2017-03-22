package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

public interface YksilointiService {
    Henkilo yksiloiManuaalisesti(final String henkiloOid);

    /**
     * Listaa palvelutunnisteet joilla yksilöinti on aktiivinen henkilölle.
     * @param oid henkilö oid
     * @return palvelutunnisteet
     */
    Iterable<String> listPalvelutunnisteet(String oid);

    /**
     * Aktivoi yksilöinnin annetulle palvelutunnisteelle.
     * @param oid henkilö oid
     * @param palvelutunniste palvelutunniste
     */
    void enableYksilointi(String oid, String palvelutunniste);

    /**
     * Kytkee yksilöinnin pois päältä annetulta palvelutunnisteelta
     * @param oid henkilö oid
     * @param palvelutunniste palvelutunniste
     */
    void disableYksilointi(String oid, String palvelutunniste);
}
