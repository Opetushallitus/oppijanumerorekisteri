package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.models.KoodiType;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.wiremock.spring.ConfigureWireMock;
import org.wiremock.spring.EnableWireMock;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@EnableWireMock(@ConfigureWireMock(port = 8097))
public class KoodistoClientImplTest {
    @Autowired
    private KoodistoClient client;

    @Test
    public void getChildOids() {
        stubFor(any(urlPathEqualTo("/koodisto-service/rest/json/koodistouri/koodi"))
            .willReturn(ok()
                .withBody("""
                        [
                            {
                                "koodiUri": "yhteystietotyypit_yhteystietotyyppi4",
                                "resourceUri": "https://virkailija.hahtuvaopintopolku.fi/koodisto-service/rest/codeelement/yhteystietotyypit_yhteystietotyyppi4",
                                "version": 1,
                                "versio": 1,
                                "koodisto": {
                                    "koodistoUri": "yhteystietotyypit",
                                    "organisaatioOid": "1.2.246.562.10.00000000001",
                                    "koodistoVersios": [
                                        1
                                    ]
                                },
                                "koodiArvo": "yhteystietotyyppi4",
                                "paivitysPvm": "2014-10-15",
                                "paivittajaOid": null,
                                "voimassaAlkuPvm": "2014-04-07",
                                "voimassaLoppuPvm": null,
                                "tila": "LUONNOS",
                                "metadata": [
                                    {
                                        "nimi": "BDS Stadigvarande adress i hemlandet",
                                        "kuvaus": "BDS Stadigvarande adress i hemlandet",
                                        "lyhytNimi": "BDS Stadigv. adress i hemland.t",
                                        "kayttoohje": null,
                                        "kasite": null,
                                        "sisaltaaMerkityksen": null,
                                        "eiSisallaMerkitysta": null,
                                        "huomioitavaKoodi": null,
                                        "sisaltaaKoodiston": null,
                                        "kieli": "SV"
                                    },
                                    {
                                        "nimi": "VTJ Vakinainen kotimainen osoite",
                                        "kuvaus": "VTJ Vakinainen kotimainen osoite",
                                        "lyhytNimi": "VTJ Vak. kotim. os.",
                                        "kayttoohje": null,
                                        "kasite": null,
                                        "sisaltaaMerkityksen": null,
                                        "eiSisallaMerkitysta": null,
                                        "huomioitavaKoodi": null,
                                        "sisaltaaKoodiston": null,
                                        "kieli": "FI"
                                    }
                                ]
                            },
                            {
                                "koodiUri": "yhteystietotyypit_yhteystietotyyppi3",
                                "resourceUri": "https://virkailija.hahtuvaopintopolku.fi/koodisto-service/rest/codeelement/yhteystietotyypit_yhteystietotyyppi3",
                                "version": 1,
                                "versio": 1,
                                "koodisto": {
                                    "koodistoUri": "yhteystietotyypit",
                                    "organisaatioOid": "1.2.246.562.10.00000000001",
                                    "koodistoVersios": [
                                        1
                                    ]
                                },
                                "koodiArvo": "yhteystietotyyppi3",
                                "paivitysPvm": "2014-10-15",
                                "paivittajaOid": null,
                                "voimassaAlkuPvm": "2014-04-07",
                                "voimassaLoppuPvm": null,
                                "tila": "LUONNOS",
                                "metadata": [
                                    {
                                        "nimi": "Fritidsadress",
                                        "kuvaus": "Fritidsadress",
                                        "lyhytNimi": "Fritidsadress",
                                        "kayttoohje": null,
                                        "kasite": null,
                                        "sisaltaaMerkityksen": null,
                                        "eiSisallaMerkitysta": null,
                                        "huomioitavaKoodi": null,
                                        "sisaltaaKoodiston": null,
                                        "kieli": "SV"
                                    },
                                    {
                                        "nimi": "Vapaa-ajan osoite",
                                        "kuvaus": "Vapaa-ajan osoite",
                                        "lyhytNimi": "Vapaa-ajan osoite",
                                        "kayttoohje": null,
                                        "kasite": null,
                                        "sisaltaaMerkityksen": null,
                                        "eiSisallaMerkitysta": null,
                                        "huomioitavaKoodi": null,
                                        "sisaltaaKoodiston": null,
                                        "kieli": "FI"
                                    }
                                ]
                            }
                        ]""")));
        List<KoodiType> childOids = client.getKoodisForKoodisto("koodistouri", 2, true);

        assertThat(childOids.stream().map(k -> k.getKoodiUri()).toList())
            .containsExactlyInAnyOrder("yhteystietotyypit_yhteystietotyyppi4", "yhteystietotyypit_yhteystietotyyppi3");
        verify(getRequestedFor(urlPathEqualTo("/koodisto-service/rest/json/koodistouri/koodi"))
            .withHeader("Caller-id", matching("1.2.246.562.10.00000000001.oppijanumerorekisteri-service"))
            .withHeader("CSRF", matching("CSRF"))
            .withHeader("Cookie", matching("CSRF=CSRF"))
            .withQueryParam("onlyValidKoodis", matching("true"))
            .withQueryParam("koodistoVersio", matching("2")));
    }

}
