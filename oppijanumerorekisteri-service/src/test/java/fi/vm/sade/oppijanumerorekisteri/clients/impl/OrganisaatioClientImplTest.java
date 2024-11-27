package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.github.tomakehurst.wiremock.WireMockServer;

import fi.vm.sade.oppijanumerorekisteri.clients.OrganisaatioClient;
import fi.vm.sade.oppijanumerorekisteri.clients.OrganisaatioClient.OrganisaatioDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioTilat;

import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.options;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class OrganisaatioClientImplTest {
    private WireMockServer server;

    @Autowired
    private OrganisaatioClient client;

    @BeforeEach
    public void startServer() {
        server = new WireMockServer(options().port(8097));
        server.start();
    }

    @AfterEach
    public void stopServer() {
        server.resetAll();
        server.stop();
    }

    @Test
    public void getByOidRetries() {
        server.stubFor(get("/organisaatio-service/rest/organisaatio/1.2.3")
            .inScenario("retry")
            .whenScenarioStateIs("Started")
            .willReturn(serverError())
            .willSetStateTo("retry"));

        server.stubFor(get("/organisaatio-service/rest/organisaatio/1.2.3")
            .inScenario("retry")
            .whenScenarioStateIs("retry")
            .willReturn(ok()
                .withBody("""
                    {
                        "oid": "1.2.3",
                        "nimi": {
                            "fi": "oyj",
                            "sv": "sv"
                        }
                    }""")));

        OrganisaatioDto org = client.getByOid("1.2.3").get();

        assertThat(org.getOid()).isEqualTo("1.2.3");
        assertThat(org.getNimi().get("fi")).isEqualTo("oyj");
        server.verify(exactly(2), getRequestedFor(urlPathEqualTo("/organisaatio-service/rest/organisaatio/1.2.3"))
            .withHeader("Caller-id", matching("1.2.246.562.10.00000000001.oppijanumerorekisteri-service"))
            .withHeader("CSRF", matching("CSRF"))
            .withHeader("Cookie", matching("CSRF=CSRF")));
    }

    @Test
    public void getByOidReturnsEmptyIfNotFound() {
        server.stubFor(get("/organisaatio-service/rest/organisaatio/1.2.3")
            .willReturn(notFound()));
        Optional<OrganisaatioDto> org = client.getByOid("1.2.3");

        assertThat(org).isEmpty();
        server.verify(exactly(1), getRequestedFor(urlPathEqualTo("/organisaatio-service/rest/organisaatio/1.2.3"))
            .withHeader("Caller-id", matching("1.2.246.562.10.00000000001.oppijanumerorekisteri-service"))
            .withHeader("CSRF", matching("CSRF"))
            .withHeader("Cookie", matching("CSRF=CSRF")));
    }

    @Test
    public void getChildOids() {
        server.stubFor(any(urlPathEqualTo("/organisaatio-service/rest/organisaatio/oid123/childoids"))
            .willReturn(ok()
                .withBody("{\"oids\": [\"oid656\", \"oid956\"]}")));
        Set<String> childOids = client.getChildOids("oid123", true, OrganisaatioTilat.vainAktiiviset());

        assertThat(childOids).containsExactlyInAnyOrder("oid656", "oid956");
        server.verify(getRequestedFor(urlPathEqualTo("/organisaatio-service/rest/organisaatio/oid123/childoids"))
            .withHeader("Caller-id", matching("1.2.246.562.10.00000000001.oppijanumerorekisteri-service"))
            .withHeader("CSRF", matching("CSRF"))
            .withHeader("Cookie", matching("CSRF=CSRF"))
            .withQueryParam("rekursiivisesti", matching("true"))
            .withQueryParam("aktiiviset", matching("true"))
            .withQueryParam("suunnitellut", matching("false"))
            .withQueryParam("lakkautetut", matching("false")));
    }

}
