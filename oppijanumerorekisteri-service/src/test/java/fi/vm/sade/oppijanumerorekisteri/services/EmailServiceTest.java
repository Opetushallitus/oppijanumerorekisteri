package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.configurations.H2Configuration;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.services.QueueingEmailService.QueuedEmail;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {OppijanumerorekisteriServiceApplication.class, DevProperties.class, H2Configuration.class})
public class EmailServiceTest {
    @MockBean
    private QueueingEmailService queueingEmailService;

    @Autowired
    private EmailService emailService;

    @Test
    public void sendTuontiKasiteltyWithErrorsEmail() {
        given(queueingEmailService.queueEmail(any())).willReturn("id");

        emailService.sendTuontiKasiteltyWithErrorsEmail(Set.of("testiii@testi.fi", "testi2@testi.fi"));

        ArgumentCaptor<QueuedEmail> emailCaptor = ArgumentCaptor.forClass(QueuedEmail.class);
        verify(queueingEmailService, times(1)).queueEmail(emailCaptor.capture());
        QueuedEmail email = emailCaptor.getValue();
        assertThat(email.getRecipients()).containsExactlyInAnyOrder("testiii@testi.fi", "testi2@testi.fi");
        assertThat(email.getBody()).isEqualToIgnoringWhitespace("""
<!doctype html>
<html lang="fi">
    <head>
        <meta charset="utf-8">
        <title>Virkailijan opintopolku: oppijoiden tuonti suoritettu</title>
        <style>
            body {
                background: #F6F4F0;
            }
            .box {
                background: #FFFFFF;
                padding: 1em 2em;
                margin: 2em 4em;
            }
        </style>
    </head>
    <body>
        <div class="box">
            <h3>Virkailijan opintopolku: oppijoiden tuonti suoritettu</h3>
            <p>Hei,</p>
            <p>käynnistämänne oppijoiden tuonnin oppijat on käsitelty, mutta kaikkia ei onnistuttu yksilöimään.</p>
            <p>Voitte korjata virheet käyttöliittymästä: <a href="https://localhost/henkilo-ui/oppijoidentuonti">https://localhost/henkilo-ui/oppijoidentuonti</a></p>
        </div>
        <div class="box" style="text-align: right;">
            <img src="http://www.oph.fi/instancedata/prime_product_julkaisu/oph/pics/opetushallitus2.gif" alt="Opetushallitus" />
        </div>
    </body>
</html>""");
    }
}
