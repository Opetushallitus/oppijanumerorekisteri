package fi.vm.sade.oppijanumerorekisteri.services;

/**
 * Oppijanumerorekisterin käyttämät koodistot.
 */
public enum Koodisto {

    SUKUPUOLI("sukupuoli", 1),
    MAAT_JA_VALTIOT_2("maatjavaltiot2", 0),
    YHTEYSTIETOTYYPIT("yhteystietotyypit", 1),
    YHTEYSTIETOJEN_ALKUPERA("yhteystietojenalkupera", 1),
    KUNTA("kunta", 2),
    KIELI("kieli", 1),
    ;

    private final String uri;
    private final int versio;

    private Koodisto(String uri, int versio) {
        this.uri = uri;
        this.versio = versio;
    }

    public String getUri() {
        return uri;
    }

    public int getVersio() {
        return versio;
    }

}
