package fi.vm.sade.oppijanumerorekisteri.vtjkysely.api;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

public class YksiloityHenkilo implements Serializable {

    private static final long serialVersionUID = 8789597334053850029L;

    private boolean passivoitu;

    private String etunimi;

    private String kutsumanimi;

    private String sukunimi;

    private List<EntinenNimi> entisetNimet;

    private String hetu;

    private String sukupuoli;

    private boolean turvakielto;

    private String sahkoposti;

    private String aidinkieliKoodi;

    private List<String> kansalaisuusKoodit;

    private List<OsoiteTieto> osoitteet;

    private String kotikunta;

    private List<Huoltaja> huoltajat = new ArrayList<>();

    private List<Huollettava> huollettavat = new ArrayList<>();

    public boolean isPassivoitu() {
        return passivoitu;
    }

    public void setPassivoitu(boolean passivoitu) {
        this.passivoitu = passivoitu;
    }

    public String getHetu() {
        return hetu;
    }

    public void setHetu(String hetu) {
        this.hetu = hetu;
    }

    public String getSukupuoli() {
        return sukupuoli;
    }

    public void setSukupuoli(String sukupuoli) {
        this.sukupuoli = sukupuoli;
    }

    public boolean isTurvakielto() {
        return turvakielto;
    }

    public void setTurvakielto(boolean turvakielto) {
        this.turvakielto = turvakielto;
    }

    public String getEtunimi() {
        return etunimi;
    }

    public void setEtunimi(String etunimi) {
        this.etunimi = etunimi;
    }

    public String getSukunimi() {
        return sukunimi;
    }

    public void setSukunimi(String sukunimi) {
        this.sukunimi = sukunimi;
    }

    public String getKutsumanimi() {
        return kutsumanimi;
    }

    public void setKutsumanimi(String kutsumanimi) {
        this.kutsumanimi = kutsumanimi;
    }

    public List<EntinenNimi> getEntisetNimet() {
        return entisetNimet;
    }

    public void setEntisetNimet(List<EntinenNimi> entisetNimet) {
        this.entisetNimet = entisetNimet;
    }

    public String getAidinkieliKoodi() {
        return aidinkieliKoodi;
    }

    public void setAidinkieliKoodi(String aidinkieliKoodi) {
        this.aidinkieliKoodi = aidinkieliKoodi;
    }

    public void addKansalaisuusKoodi(String kansalaisuusKoodi) {
        if (this.kansalaisuusKoodit == null) {
            this.kansalaisuusKoodit = new ArrayList<String>();
        }
        this.kansalaisuusKoodit.add(kansalaisuusKoodi);
    }

    public List<String> getKansalaisuusKoodit() {
        return kansalaisuusKoodit;
    }

    public List<OsoiteTieto> getOsoitteet() {
        return osoitteet;
    }

    public void addOsoiteTieto(OsoiteTieto osoite) {
        if (this.osoitteet == null) {
            this.osoitteet = new ArrayList<YksiloityHenkilo.OsoiteTieto>();
        }
        this.osoitteet.add(osoite);
    }

    public String getKotikunta() {
        return kotikunta;
    }

    public void setKotikunta(String kotikunta) {
        this.kotikunta = kotikunta;
    }

    public String getSahkoposti() {
        return sahkoposti;
    }

    public void setSahkoposti(String sahkoposti) {
        this.sahkoposti = sahkoposti;
    }

    public List<Huoltaja> getHuoltajat() {
        return huoltajat;
    }

    public void setHuoltajat(List<Huoltaja> huoltajat) {
        this.huoltajat = huoltajat;
    }

    public List<Huollettava> getHuollettavat() {
        return huollettavat;
    }

    public void setHuollettavat(List<Huollettava> huollettavat) {
       this.huollettavat = huollettavat;
    }

    public static class OsoiteTieto {

        private String tyyppi;

        private String katuosoiteS;

        private String katuosoiteR;

        private String kaupunkiS;

        private String kaupunkiR;

        private String postinumero;

        private String maaS;

        private String maaR;

        public OsoiteTieto() {

        }

        public OsoiteTieto(String tyyppi, String katuosoiteS,
                String katuosoiteR, String postinumero, String kaupunkiS,
                String kaupunkiR, String maaS, String maaR) {
            this.tyyppi = tyyppi;
            this.katuosoiteS = katuosoiteS;
            this.katuosoiteR = katuosoiteR;
            this.postinumero = postinumero;
            this.kaupunkiS = kaupunkiS;
            this.kaupunkiR = kaupunkiR;
            this.maaS = maaS;
            this.maaR = maaR;
        }

        public String getTyyppi() {
            return tyyppi;
        }

        public String getKatuosoiteS() {
            return katuosoiteS;
        }

        public String getKaupunkiS() {
            return kaupunkiS;
        }

        public String getMaaS() {
            return maaS;
        }

        public String getKatuosoiteR() {
            return katuosoiteR;
        }

        public String getKaupunkiR() {
            return kaupunkiR;
        }

        public String getMaaR() {
            return maaR;
        }

        public String getPostinumero() {
            return postinumero;
        }
    }

    public static class EntinenNimi {

        private EntinenNimiTyyppi tyyppi;
        private String arvo;

        public EntinenNimi() {

        }

        public EntinenNimi(EntinenNimiTyyppi tyyppi, String arvo) {
            this.tyyppi = tyyppi;
            this.arvo = arvo;
        }

        public void setTyyppi(EntinenNimiTyyppi tyyppi) {
            this.tyyppi = tyyppi;
        }

        public EntinenNimiTyyppi getTyyppi() {
            return tyyppi;
        }

        public void setArvo(String arvo) {
            this.arvo = arvo;
        }

        public String getArvo() {
            return arvo;
        }

        public boolean isSukunimi() {
            return tyyppi.isSukunimi();
        }

    }

    public static enum EntinenNimiTyyppi {
        TUNTEMATON(""),
        ENTINEN_SUKUNIMI("05"),
        ENTISET_ETUNIMET("06"),
        VIIMEKSI_NAIMATTOMANA_OLLESSA_OLLUT_SUKUNIMI("07"),
        ENTINEN_VALINIMI("08"),
        ENTINEN_KUTSUMANIMI("09"),
        KORJATTU_SUKUNIMI("10"),
        KORJATUT_ETUNIMET("11"),
        KORJATTU_VALINIMI("12"),
        KORJATTU_KUTSUMANIMI("13"),
        ;

        private static final Set<EntinenNimiTyyppi> SUKUNIMET = EnumSet.of(
                ENTINEN_SUKUNIMI, VIIMEKSI_NAIMATTOMANA_OLLESSA_OLLUT_SUKUNIMI, KORJATTU_SUKUNIMI);
        private final String koodi;

        private EntinenNimiTyyppi(String koodi) {
            this.koodi = koodi;
        }

        public static EntinenNimiTyyppi getByKoodi(String koodi) {
            for (EntinenNimiTyyppi tyyppi : EntinenNimiTyyppi.values()) {
                if (tyyppi.getKoodi().equals(koodi)) {
                    return tyyppi;
                }
            }
            return EntinenNimiTyyppi.TUNTEMATON;
        }

        public String getKoodi() {
            return koodi;
        }

        public boolean isSukunimi() {
            return SUKUNIMET.contains(this);
        }

    }
}
