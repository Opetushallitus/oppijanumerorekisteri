package fi.vm.sade.oppijanumerorekisteri.vtjkysely.api;

import java.util.Arrays;

/**
 * Henkilön huoltaja
 */
public class Huoltaja {
    private String etunimi;

    private String sukunimi;

    private String hetu;

    private String huoltajuustyyppiKoodi;

    public Huoltaja() {

    }

    public Huoltaja(String etunimi, String sukunimi, String hetu, String huoltajuustyyppiKoodi) {
        this.etunimi = etunimi;
        this.sukunimi = sukunimi;
        this.hetu = hetu;
        this.huoltajuustyyppiKoodi = huoltajuustyyppiKoodi;
    }

    public String getEtunimi() {
        return etunimi;
    }

    public void setEtunimi(String etunimi) {
        this.etunimi = etunimi;
    }

    public String getHetu() {
        return hetu;
    }

    public void setHetu(String hetu) {
        this.hetu = hetu;
    }

    public String getSukunimi() {
        return sukunimi;
    }

    public void setSukunimi(String sukunimi) {
        this.sukunimi = sukunimi;
    }

    public String getKutsumanimi() {
        return this.etunimi == null ? null : Arrays.stream(this.etunimi.split(" ")).findFirst().orElse(null);
    }

    public String getHuoltajuustyyppiKoodi() {
        return huoltajuustyyppiKoodi;
    }

    public void setHuoltajuustyyppiKoodi(String huoltajuustyyppiKoodi) {
        this.huoltajuustyyppiKoodi = huoltajuustyyppiKoodi;
    }
}
