package fi.vm.sade.oppijanumerorekisteri.services.export;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.core.async.AsyncResponseTransformer;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import tools.jackson.databind.json.JsonMapper;

class HenkiloExportServiceTest {
  private final S3AsyncClient s3 = mock(S3AsyncClient.class);
  private final HenkiloExportService service =
      new HenkiloExportService(mock(JdbcTemplate.class), s3);

  @Test
  void manifestChangesOnlyWhenCsvBytesChangeEvenWithDifferentVersions() {
    ReflectionTestUtils.setField(service, "bucketName", "export-bucket");
    ReflectionTestUtils.setField(service, "kmsKeyArn", "export-key");
    var manifests = new ArrayList<String>();
    when(s3.getObject(
            org.mockito.ArgumentMatchers.<Consumer<GetObjectRequest.Builder>>any(),
            org.mockito.ArgumentMatchers
                .<AsyncResponseTransformer<GetObjectResponse, ResponseInputStream<GetObjectResponse>>>
                    any()))
        .thenReturn(
            csv("henkilo_oid\n1\n", "version-1"),
            csv("henkilo_oid\n1\n", "version-2"),
            csv("henkilo_oid\n2\n", "version-3"));
    when(s3.putObject(
            org.mockito.ArgumentMatchers.<Consumer<PutObjectRequest.Builder>>any(),
            any(AsyncRequestBody.class)))
        .thenAnswer(invocation -> {
          Consumer<PutObjectRequest.Builder> configure = invocation.getArgument(0);
          var request = PutObjectRequest.builder();
          configure.accept(request);
          assertThat(request.build().key()).isEqualTo("fulldump/henkilo/v1/manifest.json");
          AsyncRequestBody body = invocation.getArgument(1);
          var bytes = new ByteArrayOutputStream();
          body.subscribe(buffer -> {
            var chunk = new byte[buffer.remaining()];
            buffer.get(chunk);
            bytes.writeBytes(chunk);
          }).join();
          manifests.add(bytes.toString(StandardCharsets.UTF_8));
          return CompletableFuture.completedFuture(PutObjectResponse.builder().build());
        });

    service.generateExport();
    service.generateExport();
    service.generateExport();

    assertThat(manifests.get(0)).isEqualTo(manifests.get(1));
    assertThat(manifests.get(2)).isNotEqualTo(manifests.get(0));
    var file = JsonMapper.builder().build().readTree(manifests.get(0)).get("exportFiles").get(0);
    assertThat(file.get("objectKey").asText()).isEqualTo("fulldump/henkilo/v1/henkilo.csv");
    assertThat(file.get("objectSha256String").asText())
        .isEqualTo("7ffde948d316a60cc47c6c170c0fdbc6eedcf8b8f5a1d9ee9be6f1a45b8931d6");
    assertThat(file.has("objectVersion")).isFalse();
  }

  @Test
  void failedDownloadDoesNotPublishManifest() {
    when(s3.getObject(
            org.mockito.ArgumentMatchers.<Consumer<GetObjectRequest.Builder>>any(),
            org.mockito.ArgumentMatchers
                .<AsyncResponseTransformer<GetObjectResponse, ResponseInputStream<GetObjectResponse>>>
                    any()))
        .thenReturn(CompletableFuture.failedFuture(new IllegalStateException("Download failed")));

    assertThatThrownBy(service::generateExport).hasRootCauseMessage("Download failed");
    verify(s3, never()).putObject(
        org.mockito.ArgumentMatchers.<Consumer<PutObjectRequest.Builder>>any(),
        any(AsyncRequestBody.class));
  }

  private CompletableFuture<ResponseInputStream<GetObjectResponse>> csv(String bytes, String version) {
    return CompletableFuture.completedFuture(
        new ResponseInputStream<>(
            GetObjectResponse.builder().versionId(version).build(),
            new ByteArrayInputStream(bytes.getBytes(StandardCharsets.UTF_8))));
  }
}
