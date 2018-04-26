package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@IntegrationTest
public class KayttooikeusClientImplTest {

    @Autowired
    private KayttooikeusClientImpl kayttooikeusClient;

    @Test
    public void getPassivoiHenkiloUrlKasittelijaOid() throws IOException {
        String kasittelijaOid = "oid2";

        String url = kayttooikeusClient.getPassivoiHenkiloUrl("oid1", kasittelijaOid);

        assertThat(url).isEqualTo("https://localhost/kayttooikeus-service/henkilo/oid1/passivoi?kasittelijaOid=oid2");
    }

    @Test
    public void getPassivoiHenkiloUrlIlmanKasittelijaOid() throws IOException {
        String kasittelijaOid = null;

        String url = kayttooikeusClient.getPassivoiHenkiloUrl("oid1", kasittelijaOid);

        assertThat(url).isEqualTo("https://localhost/kayttooikeus-service/henkilo/oid1/passivoi");
    }

}
