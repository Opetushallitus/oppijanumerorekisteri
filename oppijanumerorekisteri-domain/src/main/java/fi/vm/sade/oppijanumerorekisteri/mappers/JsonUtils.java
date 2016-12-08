package fi.vm.sade.oppijanumerorekisteri.mappers;

public class JsonUtils {
    public static String getDefaultHenkiloDtoAsJson() {
        return "{\"aidinkieli\": {\"kielikoodi\": \"fi\", \"kielityyppi\": \"suomi\" }," +
                "  \"kielisyys\": [ { \"kielikoodi\": \"fi\", \"kielityyppi\": \"suomi\" } ]," +
                "  \"kansalaisuus\": [ { \"kansalaisuuskoodi\": \"246\" } ]," +
                "  \"etunimet\": \"arpa\"," +
                "  \"hetu\": \"081296-967T\"," +
                "  \"kutsumanimi\": \"arpa\"," +
                "  \"oidhenkilo\": \"1.2.3.4.5\"," +
                "  \"sukunimi\": \"kuutio\"," +
                "  \"passivoitu\": false," +
                "  \"henkilotyyppi\": \"VIRKAILIJA\"," +
                "  \"kasittelijaOid\": \"1.2.3.4.1\"," +
                "  \"asiointikieli\": { \"kielikoodi\": \"fi\", \"kielityyppi\": \"suomi\" }," +
                "  \"sukupuoli\": \"1\"," +
                "  \"syntymaaika\": 24364800000}";
    }
    public static String getDefaultHenkiloUpdateAsJson() {
        return "{  \"aidinkieli\": {\"kielikoodi\": \"fi\", \"kielityyppi\": \"suomi\" }," +
                "  \"asiointikieli\": { \"kielikoodi\": \"fi\", \"kielityyppi\": \"suomi\" }," +
                "  \"kielisyys\": [ { \"kielikoodi\": \"fi\", \"kielityyppi\": \"suomi\" } ]," +
                "  \"eiSuomalaistaHetua\": false," +
                "  \"etunimet\": \"arpa\"," +
                "  \"henkilotyyppi\": \"OPPIJA\"," +
                "  \"hetu\": \"081296-967T\"," +
                "  \"kansalaisuus\": [ { \"kansalaisuuskoodi\": \"246\" } ]," +
                "  \"kasittelijaOid\": \"1.2.3.4.1\"," +
                "  \"kutsumanimi\": \"arpa\"," +
                "  \"muokkausPvm\": \"2016-11-23T12:59:51.700Z\"," +
                "  \"oidhenkilo\": \"1.2.3.4.5\"," +
                "  \"sukunimi\": \"kuutio\"," +
                "  \"sukupuoli\": \"1\"," +
                "  \"syntymaaika\": \"2016-11-23T12:59:51.700Z\"," +
                "  \"yhteystiedotRyhmas\": [ { \"readOnly\": true, \"ryhmaAlkuperaTieto\": \"RYHMAALKUPERA_MUU\"," +
                "      \"ryhmaKuvaus\": \"TYOOSOITE\", \"yhteystieto\": [ { \"yhteystietoArvo\": \"arpa@kuutio.fi\"," +
                "          \"yhteystietoTyyppi\": \"YHTEYSTIETO_SAHKOPOSTI\" } ] } ]" +
                "}";
    }
}
