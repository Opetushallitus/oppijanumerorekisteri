package fi.vm.sade.oppijanumerorekisteri.vtjkysely.api;

public class Huollettava {
    private String etunimet;
    private String sukunimi;
    private String hetu;

    public Huollettava() { }

    public Huollettava(String etunimet, String sukunimi, String hetu) {
        this.etunimet = etunimet;
        this.sukunimi = sukunimi;
        this.hetu = hetu;
    }

    public void setEtunimet(String etunimet) {
        this.etunimet = etunimet;
    }

    public String getEtunimet() {
       return etunimet;
    }

    public void setSukunimi(String sukunimi) {
        this.sukunimi = sukunimi;
    }

    public String getSukunimi() {
        return sukunimi;
    }

    public void setHetu(String hetu) {
        this.hetu = hetu;
    }

    public String getHetu() {
        return hetu;
    }
}
