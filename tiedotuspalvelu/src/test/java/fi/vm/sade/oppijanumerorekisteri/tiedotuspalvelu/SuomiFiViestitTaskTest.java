package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
public class SuomiFiViestitTaskTest {

  @Autowired private SuomiFiViestitTask suomiFiViestitTask;

  @Autowired private TiedoteRepository tiedoteRepository;

  @MockitoBean private SuomiFiViestitService suomiFiViestitService;

  @MockitoBean private JwtDecoder jwtDecoder;

  @BeforeEach
  public void setup() {
    tiedoteRepository.deleteAll();
  }

  @Test
  public void processesOnlyUnsent() {
    var unsent1 =
        tiedoteRepository.save(
            Tiedote.builder()
                .oppijanumero("1.2.246.562.24.00000000001")
                .url("https://a.example")
                .suomiFiViestiSent(false)
                .build());
    var unsent2 =
        tiedoteRepository.save(
            Tiedote.builder()
                .oppijanumero("1.2.246.562.24.00000000002")
                .url("https://b.example")
                .suomiFiViestiSent(false)
                .build());
    var sent =
        tiedoteRepository.save(
            Tiedote.builder()
                .oppijanumero("1.2.246.562.24.00000000003")
                .url("https://c.example")
                .suomiFiViestiSent(true)
                .build());

    suomiFiViestitTask.execute();

    verify(suomiFiViestitService, times(1))
        .sendSuomiFiViesti(
            org.mockito.ArgumentMatchers.argThat(t -> t.getId().equals(unsent1.getId())));
    verify(suomiFiViestitService, times(1))
        .sendSuomiFiViesti(
            org.mockito.ArgumentMatchers.argThat(t -> t.getId().equals(unsent2.getId())));
    verify(suomiFiViestitService, times(0))
        .sendSuomiFiViesti(
            org.mockito.ArgumentMatchers.argThat(t -> t.getId().equals(sent.getId())));

    assertTrue(tiedoteRepository.findById(unsent1.getId()).orElseThrow().isSuomiFiViestiSent());
    assertTrue(tiedoteRepository.findById(unsent2.getId()).orElseThrow().isSuomiFiViestiSent());
    assertTrue(tiedoteRepository.findById(sent.getId()).orElseThrow().isSuomiFiViestiSent());
  }
}
