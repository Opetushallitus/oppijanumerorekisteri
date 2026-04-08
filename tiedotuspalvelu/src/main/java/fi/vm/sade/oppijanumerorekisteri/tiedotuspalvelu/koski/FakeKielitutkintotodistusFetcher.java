package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.koski;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "tiedotuspalvelu.testapi.enabled")
@Slf4j
public class FakeKielitutkintotodistusFetcher implements KielitutkintotodistusFetcher {

  @PostConstruct
  private void postConstruct() {
    log.info("Constructed {}", getClass().getSimpleName());
  }

  public byte[] fetchPdf(String bucketName, String objectKey) {
    log.info(
        "Kielitutkintotodistus pdf from S3 bucket {} and object key {} requested",
        bucketName,
        objectKey);
    try (var is = this.getClass().getResourceAsStream("/fakekielitutkintotodistus.pdf")) {
      return is.readAllBytes();
    } catch (Exception e) {
      throw new RuntimeException("Failed to get kielitutkintotodistus pdf from Koski", e);
    }
  }
}
