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
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Stream;

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
              y_katuosoite.yhteystieto_arvo AS vtj_katuosoite,
              y_postinumero.yhteystieto_arvo as vtj_postinumero,
              y_kaupunki.yhteystieto_arvo AS vtj_kaupunki,
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
            FROM henkilo h
            JOIN yhteystiedotryhma y ON h.id = y.henkilo_id
            JOIN yhteystiedot y_katuosoite ON y.id = y_katuosoite.yhteystiedotryhma_id
            JOIN yhteystiedot y_postinumero ON y.id = y_postinumero.yhteystiedotryhma_id
            JOIN yhteystiedot y_kaupunki ON y.id = y_kaupunki.yhteystiedotryhma_id
            WHERE y.ryhma_alkuperatieto = 'alkupera1'
            AND y_katuosoite.yhteystieto_tyyppi = 'YHTEYSTIETO_KATUOSOITE'
            AND y_postinumero.yhteystieto_tyyppi = 'YHTEYSTIETO_POSTINUMERO'
            AND y_kaupunki.yhteystieto_tyyppi = 'YHTEYSTIETO_KAUPUNKI'
        """);
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS export CASCADE");
        jdbcTemplate.execute("ALTER SCHEMA exportnew RENAME TO export");
    }

    private static final String HENKILO_QUERY = "SELECT * FROM export.henkilo";

    public void generateExportFiles() throws IOException {
        generateCsvExports();
        generateJsonExports();
    }

    List<File> generateJsonExports() throws IOException {
        var henkiloFile = exportQueryToS3AsJson(HENKILO_QUERY, S3_PREFIX + "/json/henkilo.json", unchecked(rs ->
                new ExportedHenkilo(
                        rs.getString("oppija_oid"),
                        rs.getString("hetu"),
                        rs.getString("sukupuoli"),
                        rs.getString("syntymaaika"),
                        rs.getString("sukunimi"),
                        rs.getString("etunimet"),
                        rs.getString("aidinkieli"),
                        rs.getString("turvakielto"),
                        rs.getString("kotikunta"),
                        rs.getString("yksiloityvtj"),
                        rs.getString("vtj_katuosoite"),
                        rs.getString("vtj_postinumero"),
                        rs.getString("vtj_kaupunki"),
                        rs.getString("kansalaisuus"),
                        rs.getString("master_oid"),
                        rs.getString("linkitetyt_oidit")
                )
        ));
        return List.of(henkiloFile);
    }

    private <T, R, E extends Throwable> Function<T, R> unchecked(ThrowingFunction<T, R, E> f) {
        return t -> {
            try {
                return f.apply(t);
            } catch (Throwable e) {
                throw new RuntimeException(e);
            }
        };
    }

    private interface ThrowingFunction<T, R, E extends Throwable> {

        R apply(T rs) throws E;
    }

    private <T> File exportQueryToS3AsJson(String query, String objectKey, Function<ResultSet, T> mapper) throws IOException {
        @SuppressWarnings("java:S5443")
        var tempFile = File.createTempFile("export", ".json");
        var bucketName = properties.getTasks().getExport().getBucketName();
        try {
            exportToFile(query, mapper, tempFile);
            uploadFile(opintopolkuS3Client, bucketName, objectKey, tempFile);
        } finally {
            Files.deleteIfExists(tempFile.toPath());
        }
        return tempFile;
    }

    private <T> void exportToFile(String query, Function<ResultSet, T> mapper, File file) throws IOException {
        log.info("Writing JSON export to {}", file.getAbsolutePath());
        try (var writer = Files.newBufferedWriter(file.toPath(), StandardCharsets.UTF_8)) {
            writer.write("[\n");
            var firstElement = true;
            try (Stream<T> stream = jdbcTemplate.queryForStream(query, (rs, n) -> mapper.apply(rs))) {
                Iterable<T> iterable = stream::iterator;
                for (T jsonObject : iterable) {
                    if (firstElement) {
                        firstElement = false;
                    } else {
                        writer.write(",\n");
                    }
                    writer.write(objectMapper.writeValueAsString(jsonObject));
                }
            }
            writer.write("\n");
            writer.write("]\n");
        }
    }

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

        var jsonManifest = new ArrayList<ExportFileDetails>();
        jsonManifest.add(copyFileToLampi(S3_PREFIX + "/json/henkilo.json"));
        writeManifest(S3_PREFIX + "/json/manifest.json", new ExportManifest(jsonManifest));
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
    record ExportedHenkilo(String oppijaOid,
                           String hetu,
                           String sukupuoli,
                           String syntymaaika,
                           String sukunimi,
                           String etunimet,
                           String aidinkieli,
                           String turvakielto,
                           String kotikunta,
                           String yksiloityvtj,
                           String vtj_katuosoite,
                           String vtj_postinumero,
                           String vtj_kaupunki,
                           String kansalaisuus,
                           String masterOid,
                           String linkitetyt_oidit) {}
}