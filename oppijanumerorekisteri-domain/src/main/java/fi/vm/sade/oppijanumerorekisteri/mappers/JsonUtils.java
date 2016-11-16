package fi.vm.sade.oppijanumerorekisteri.mappers;

public class JsonUtils {
    public static String getDefaultHenkiloDtoAsJson() {
        return "{\"aidinkieli\": {\"kielikoodi\": \"fi\", \"kielityyppi\": \"suomi\" }," +
                "  \"kielisyys\": [ { \"kielikoodi\": \"fi\", \"kielityyppi\": \"suomi\" } ]," +
                "  \"kansalaisuus\": [ { \"kansalaisuuskoodi\": \"246\" } ]," +
                "  \"etunimet\": \"arpa\"," +
                "  \"hetu\": \"123456-9999\"," +
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
}
