package fi.vm.sade.oppijanumerorekisteri.services.export;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.transfer.s3.S3TransferManager;
import software.amazon.awssdk.transfer.s3.model.DownloadFileRequest;
import software.amazon.awssdk.transfer.s3.model.UploadFileRequest;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ExportService {
    private final JdbcTemplate jdbcTemplate;
    private static final String S3_PREFIX = "fulldump/oppijanumerorekisteri/v2";
    private final OppijanumerorekisteriProperties properties;
    private final S3AsyncClient opintopolkuS3Client;
    private final S3AsyncClient lampiS3Client;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .setSerializationInclusion(JsonInclude.Include.NON_NULL);


    @Transactional
    public void createSchema() {
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS exportnew CASCADE");
        jdbcTemplate.execute("CREATE SCHEMA exportnew");
        jdbcTemplate.execute("""
            CREATE TABLE exportnew.henkilo AS
            SELECT
              h.oidhenkilo AS oppija_oid,
              h.hetu,
              h.sukupuoli,
              h.syntymaaika,
              h.sukunimi,
              h.etunimet,
              h.aidinkieli_id as aidinkieli,              
              h.turvakielto,
              h.kotikunta,
              h.yksiloityvtj,
              (SELECT string_agg(cast (kansalaisuus_id as varchar), ',')
               FROM henkilo_kansalaisuus
               WHERE henkilo_id = h.id
              ) AS kansalaisuus,
              (SELECT master_oid
               FROM henkiloviite
               WHERE slave_oid = h.oidhenkilo
               LIMIT 1
              ) AS master_oid,
              (SELECT string_agg(slave_oid, ',')
               FROM henkiloviite
               WHERE master_oid = h.oidhenkilo
              ) AS linkitetyt_oidit
            FROM henkilo h;
        """);
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS export CASCADE");
        jdbcTemplate.execute("ALTER SCHEMA exportnew RENAME TO export");
    }

    private static final String HENKILO_QUERY = "SELECT * FROM export.henkilo";
    public void generateCsvExports() {
        exportQueryToS3(S3_PREFIX + "/csv/henkilo.csv", HENKILO_QUERY);
    }

    private void exportQueryToS3(String objectKey, String query) {
        var bucketName = properties.getTasks().getExport().getBucketName();

        log.info("Exporting table to S3: {}/{}", bucketName, objectKey);
        var sql = "SELECT rows_uploaded FROM aws_s3.query_export_to_s3(?, aws_commons.create_s3_uri(?, ?, ?), options := 'FORMAT CSV, HEADER TRUE')";
        var rowsUploaded = jdbcTemplate.queryForObject(sql, Long.class, query, bucketName, objectKey, Region.EU_WEST_1.id());
        log.info("Exported {} rows to S3 object {}", rowsUploaded, objectKey);
    }

    public void copyExportFilesToLampi() throws IOException {
        var csvManifest = new ArrayList<ExportFileDetails>();
        csvManifest.add(copyFileToLampi(S3_PREFIX + "/csv/henkilo.csv"));
        writeManifest(S3_PREFIX + "/csv/manifest.json", new ExportManifest(csvManifest));
    }

    private ExportFileDetails copyFileToLampi(String objectKey) throws IOException {
        @SuppressWarnings("java:S5443")
        var temporaryFile = File.createTempFile("export", ".csv");
        var bucketName = properties.getTasks().getExport().getBucketName();
        var lampiBucketName = properties.getTasks().getExport().getLampiBucketName();
        try {
            log.info("Downloading file from S3: {}/{}", bucketName, objectKey);
            try (var downloader = S3TransferManager.builder().s3Client(opintopolkuS3Client).build()) {
                var fileDownload = downloader.downloadFile(DownloadFileRequest.builder()
                        .getObjectRequest(b -> b.bucket(bucketName).key(objectKey))
                        .destination(temporaryFile)
                        .build());
                fileDownload.completionFuture().join();
            }

            var response = uploadFile(lampiS3Client, lampiBucketName, objectKey, temporaryFile);
            return new ExportFileDetails(objectKey, response.versionId());
        } finally {
            Files.deleteIfExists(temporaryFile.toPath());
        }
    }

    private PutObjectResponse uploadFile(S3AsyncClient s3Client, String bucketName, String objectKey, File file) {
        log.info("Uploading file to S3: {}/{}", bucketName, objectKey);
        try (var uploader = S3TransferManager.builder().s3Client(s3Client).build()) {
            var fileUpload = uploader.uploadFile(UploadFileRequest.builder()
                    .putObjectRequest(b -> b.bucket(bucketName).key(objectKey))
                    .source(file)
                    .build());
            var result = fileUpload.completionFuture().join();
            return result.response();
        }
    }

    private void writeManifest(String objectKey, ExportManifest manifest) throws JsonProcessingException {
        var lampiBucketName = properties.getTasks().getExport().getLampiBucketName();
        var manifestJson = objectMapper.writeValueAsString(manifest);
        var response = lampiS3Client.putObject(
                b -> b.bucket(lampiBucketName).key(objectKey),
                AsyncRequestBody.fromString(manifestJson)
        ).join();
        log.info("Wrote manifest to S3: {}", response);
    }

    record ExportManifest(List<ExportFileDetails> exportFiles) {}
    record ExportFileDetails(String objectKey, String objectVersion) {}
}