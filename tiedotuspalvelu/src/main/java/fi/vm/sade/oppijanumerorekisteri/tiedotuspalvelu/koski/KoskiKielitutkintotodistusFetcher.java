package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.koski;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.async.AsyncResponseTransformer;
import software.amazon.awssdk.services.s3.S3AsyncClient;

@Component
@ConditionalOnProperty(name = "tiedotuspalvelu.koski-role-arn")
@RequiredArgsConstructor
public class KoskiKielitutkintotodistusFetcher implements KielitutkintotodistusFetcher {

  @Qualifier(KoskiConfiguration.QUALIFIER)
  private final S3AsyncClient koskiS3Client;

  public byte[] fetchPdf(String bucketName, String objectKey) {
    try {
      var future =
          koskiS3Client.getObject(
              builder -> builder.bucket(bucketName).key(objectKey),
              AsyncResponseTransformer.toBytes());
      return future.get(30, TimeUnit.SECONDS).asByteArray();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException("Failed to get kielitutkintotodistus pdf from Koski", e);
    } catch (ExecutionException | TimeoutException e) {
      throw new RuntimeException("Failed to get kielitutkintotodistus pdf from Koski", e);
    }
  }
}
