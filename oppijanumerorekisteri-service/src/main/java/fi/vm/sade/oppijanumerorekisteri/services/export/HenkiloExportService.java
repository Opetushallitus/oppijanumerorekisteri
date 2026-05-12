package fi.vm.sade.oppijanumerorekisteri.services.export;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.cfg.DateTimeFeature;
import tools.jackson.databind.json.JsonMapper;

@Slf4j
@RequiredArgsConstructor
@Service
public class HenkiloExportService {
  @Value("${oppijanumerorekisteri.tasks.henkilo-export.bucket-name}")
  String bucketName;

  private final JdbcTemplate jdbcTemplate;
  private final S3AsyncClient onrS3Client;
  private final ObjectMapper objectMapper =
      JsonMapper.builder()
          .changeDefaultPropertyInclusion(
              incl -> incl.withValueInclusion(JsonInclude.Include.NON_NULL))
          .changeDefaultPropertyInclusion(
              incl -> incl.withContentInclusion(JsonInclude.Include.NON_NULL))
          .disable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS)
          .build();

  public void generateExport() throws JsonProcessingException {
    var exportFiles = new ArrayList<ExportFileDetails>();
    exportFiles.add(
        exportQueryToCsv(
            key("henkilo.csv"), "SELECT h.oidhenkilo AS henkilo_oid ORDER BY h.oidhenkilo"));
    writeManifest(new ExportManifest(exportFiles));
  }

  private ExportFileDetails exportQueryToCsv(String objectKey, String query) {
    log.info("Exporting to S3: {}/{}", bucketName, objectKey);
    var sql =
        "SELECT rows_uploaded FROM aws_s3.query_export_to_s3(?, aws_commons.create_s3_uri(?, ?, ?), options := 'FORMAT CSV, HEADER TRUE')";
    var rowsUploaded =
        jdbcTemplate.queryForObject(
            sql, Long.class, query, bucketName, objectKey, Region.EU_WEST_1.id());
    log.info("Exported {} rows to S3 object {}", rowsUploaded, objectKey);
    return new ExportFileDetails(objectKey, objectVersion(objectKey));
  }

  private String objectVersion(String objectKey) {
    return onrS3Client.headObject(b -> b.bucket(bucketName).key(objectKey)).join().versionId();
  }

  private void writeManifest(ExportManifest manifest) throws JsonProcessingException {
    var manifestKey = key("manifest.json");
    log.info("Writing manifest file {}/{}: {}", bucketName, manifestKey, manifest);
    var manifestJson = objectMapper.writeValueAsString(manifest);
    var response =
        onrS3Client
            .putObject(
                b -> b.bucket(bucketName).key(manifestKey),
                AsyncRequestBody.fromString(manifestJson))
            .join();
    log.info("Wrote manifest to S3: {}", response);
  }

  private String key(String filename) {
    return "fulldump/henkilo/v1/" + filename;
  }
}
