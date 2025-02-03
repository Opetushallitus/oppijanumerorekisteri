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
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Stream;

@Slf4j
@RequiredArgsConstructor
@Service
public class ExportService {
    private final JdbcTemplate jdbcTemplate;
    private static final String S3_PREFIX_V2 = "fulldump/oppijanumerorekisteri/v2";
    private static final String S3_PREFIX_V3 = "fulldump/oppijanumerorekisteri/v3";
    private final OppijanumerorekisteriProperties properties;
    private final S3AsyncClient onrS3Client;
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
              h.oidhenkilo AS henkilo_oid,
              h.hetu,
              h.sukupuoli,
              h.syntymaaika,
              h.sukunimi,
              h.etunimet,
              aidinkieli.kielikoodi as aidinkieli,
              h.turvakielto,
              h.kotikunta,
              h.yksiloityvtj,
              (SELECT string_agg(cast (kansalaisuuskoodi as varchar), ',')
               FROM henkilo_kansalaisuus
               JOIN kansalaisuus ON kansalaisuus.id = henkilo_kansalaisuus.kansalaisuus_id
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
              ) AS linkitetyt_oidit,
            created at time zone 'Europe/Helsinki' as created,
            modified at time zone 'Europe/Helsinki' AS updated
            FROM henkilo h
            LEFT JOIN kielisyys aidinkieli ON h.aidinkieli_id = aidinkieli.id
        """);
        jdbcTemplate.execute("""
            CREATE TABLE exportnew.yhteystieto AS
            SELECT
              h.oidhenkilo AS henkilo_oid,
              y.ryhmakuvaus AS yhteystietotyyppi,
              yt.yhteystieto_arvo,
              yt.yhteystieto_tyyppi AS yhteystieto_arvo_tyyppi,
              y.ryhma_alkuperatieto AS alkupera
            FROM yhteystiedotryhma y
            JOIN henkilo h ON y.henkilo_id = h.id
            JOIN yhteystiedot yt ON y.id = yt.yhteystiedotryhma_id
            WHERE yhteystieto_arvo IS NOT NULL
        """);
        jdbcTemplate.execute("ALTER TABLE exportnew.henkilo ADD CONSTRAINT henkilo_pk PRIMARY KEY (henkilo_oid)");
        jdbcTemplate.execute("ALTER TABLE exportnew.yhteystieto ADD CONSTRAINT henkilo_fk FOREIGN KEY (henkilo_oid) REFERENCES exportnew.henkilo (henkilo_oid)");
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS export CASCADE");
        jdbcTemplate.execute("ALTER SCHEMA exportnew RENAME TO export");
    }

    private static final String HENKILO_QUERY_V2 = """
            SELECT
                henkilo_oid,
                hetu,
                sukupuoli,
                syntymaaika,
                sukunimi,
                etunimet,
                aidinkieli,
                turvakielto,
                kotikunta,
                yksiloityvtj,
                kansalaisuus,
                master_oid,
                linkitetyt_oidit
            FROM export.henkilo""";
    private static final String HENKILO_QUERY_V3 = """
            SELECT
                henkilo_oid,
                hetu,
                sukupuoli,
                syntymaaika,
                sukunimi,
                etunimet,
                aidinkieli,
                turvakielto,
                kotikunta,
                yksiloityvtj,
                kansalaisuus,
                master_oid,
                linkitetyt_oidit,
                created,
                updated'
            FROM export.henkilo""";
    private static final String YHTEYSTIETO_QUERY_V2 = "SELECT * FROM export.yhteystieto";
    private static final String YHTEYSTIETO_QUERY_V3 = YHTEYSTIETO_QUERY_V2;

    public void generateExportFiles() throws IOException {
        generateCsvExportsV2();
        generateCsvExportsV3();
        generateJsonExportsV2();
        generateJsonExportsV3();
    }

    List<File> generateJsonExportsV2() throws IOException {
        var henkiloFile = exportQueryToS3AsJson(HENKILO_QUERY_V2, S3_PREFIX_V2 + "/json/henkilo.json", unchecked(rs ->
                new ExportedHenkiloV2(
                        rs.getString("henkilo_oid"),
                        rs.getString("hetu"),
                        rs.getString("sukupuoli"),
                        rs.getString("syntymaaika"),
                        rs.getString("sukunimi"),
                        rs.getString("etunimet"),
                        rs.getString("aidinkieli"),
                        rs.getBoolean("turvakielto"),
                        rs.getString("kotikunta"),
                        rs.getBoolean("yksiloityvtj"),
                        rs.getString("kansalaisuus"),
                        rs.getString("master_oid"),
                        rs.getString("linkitetyt_oidit")
                )
        ));
        var yhteystietoFile = exportQueryToS3AsJson(YHTEYSTIETO_QUERY_V2, S3_PREFIX_V2 + "/json/yhteystieto.json", unchecked(rs ->
                new ExportedYhteystietoV2(
                        rs.getString("henkilo_oid"),
                        rs.getString("yhteystietotyyppi"),
                        rs.getString("yhteystieto_arvo"),
                        rs.getString("yhteystieto_arvo_tyyppi"),
                        rs.getString("alkupera")
                )
        ));
        return List.of(henkiloFile, yhteystietoFile);
    }

    List<File> generateJsonExportsV3() throws IOException {
        var henkiloFile = exportQueryToS3AsJson(HENKILO_QUERY_V3, S3_PREFIX_V3 + "/json/henkilo.json", unchecked(rs ->
                new ExportedHenkiloV3(
                        rs.getString("henkilo_oid"),
                        rs.getString("hetu"),
                        rs.getString("sukupuoli"),
                        rs.getString("syntymaaika"),
                        rs.getString("sukunimi"),
                        rs.getString("etunimet"),
                        rs.getString("aidinkieli"),
                        rs.getBoolean("turvakielto"),
                        rs.getString("kotikunta"),
                        rs.getBoolean("yksiloityvtj"),
                        rs.getString("kansalaisuus"),
                        rs.getString("master_oid"),
                        rs.getString("linkitetyt_oidit"),
                        rs.getTimestamp("created"),
                        rs.getTimestamp("updated")
                )
        ));
        var yhteystietoFile = exportQueryToS3AsJson(YHTEYSTIETO_QUERY_V3, S3_PREFIX_V3 + "/json/yhteystieto.json", unchecked(rs ->
                new ExportedYhteystietoV3(
                        rs.getString("henkilo_oid"),
                        rs.getString("yhteystietotyyppi"),
                        rs.getString("yhteystieto_arvo"),
                        rs.getString("yhteystieto_arvo_tyyppi"),
                        rs.getString("alkupera")
                )
        ));
        return List.of(henkiloFile, yhteystietoFile);
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
            uploadFile(onrS3Client, bucketName, objectKey, tempFile);
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

    public void generateCsvExportsV2() {
        exportQueryToS3(S3_PREFIX_V2 + "/csv/henkilo.csv", HENKILO_QUERY_V2);
        exportQueryToS3(S3_PREFIX_V2 + "/csv/yhteystieto.csv", YHTEYSTIETO_QUERY_V2);
    }

    public void generateCsvExportsV3() {
        exportQueryToS3(S3_PREFIX_V3 + "/csv/henkilo.csv", HENKILO_QUERY_V3);
        exportQueryToS3(S3_PREFIX_V3 + "/csv/yhteystieto.csv", YHTEYSTIETO_QUERY_V3);
    }

    private void exportQueryToS3(String objectKey, String query) {
        var bucketName = properties.getTasks().getExport().getBucketName();

        log.info("Exporting table to S3: {}/{}", bucketName, objectKey);
        var sql = "SELECT rows_uploaded FROM aws_s3.query_export_to_s3(?, aws_commons.create_s3_uri(?, ?, ?), options := 'FORMAT CSV, HEADER TRUE')";
        var rowsUploaded = jdbcTemplate.queryForObject(sql, Long.class, query, bucketName, objectKey, Region.EU_WEST_1.id());
        log.info("Exported {} rows to S3 object {}", rowsUploaded, objectKey);
    }

    public void copyExportFilesToLampi() throws IOException {
        copyExportFilesToLampiV2();
        copyExportFilesToLampiV3();
    }

    private void copyExportFilesToLampiV2() throws IOException {
        var csvManifest = new ArrayList<ExportFileDetails>();
        csvManifest.add(copyFileToLampi(S3_PREFIX_V2 + "/csv/henkilo.csv"));
        csvManifest.add(copyFileToLampi(S3_PREFIX_V2 + "/csv/yhteystieto.csv"));
        writeManifest(S3_PREFIX_V2 + "/csv/manifest.json", new ExportManifest(csvManifest));

        var jsonManifest = new ArrayList<ExportFileDetails>();
        jsonManifest.add(copyFileToLampi(S3_PREFIX_V2 + "/json/henkilo.json"));
        jsonManifest.add(copyFileToLampi(S3_PREFIX_V2 + "/json/yhteystieto.json"));
        writeManifest(S3_PREFIX_V2 + "/json/manifest.json", new ExportManifest(jsonManifest));
    }

    private void copyExportFilesToLampiV3() throws IOException {
        var csvManifest = new ArrayList<ExportFileDetails>();
        csvManifest.add(copyFileToLampi(S3_PREFIX_V3 + "/csv/henkilo.csv"));
        csvManifest.add(copyFileToLampi(S3_PREFIX_V3 + "/csv/yhteystieto.csv"));
        writeManifest(S3_PREFIX_V3 + "/csv/manifest.json", new ExportManifest(csvManifest));

        var jsonManifest = new ArrayList<ExportFileDetails>();
        jsonManifest.add(copyFileToLampi(S3_PREFIX_V3 + "/json/henkilo.json"));
        jsonManifest.add(copyFileToLampi(S3_PREFIX_V3 + "/json/yhteystieto.json"));
        writeManifest(S3_PREFIX_V3 + "/json/manifest.json", new ExportManifest(jsonManifest));
    }

    private ExportFileDetails copyFileToLampi(String objectKey) throws IOException {
        @SuppressWarnings("java:S5443")
        var temporaryFile = File.createTempFile("export", ".csv");
        var bucketName = properties.getTasks().getExport().getBucketName();
        var lampiBucketName = properties.getTasks().getExport().getLampiBucketName();
        try {
            log.info("Downloading file from S3: {}/{}", bucketName, objectKey);
            try (var downloader = S3TransferManager.builder().s3Client(onrS3Client).build()) {
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
    record ExportedHenkiloV2(String henkilo_oid,
                             String hetu,
                             String sukupuoli,
                             String syntymaaika,
                             String sukunimi,
                             String etunimet,
                             String aidinkieli,
                             boolean turvakielto,
                             String kotikunta,
                             boolean yksiloityvtj,
                             String kansalaisuus,
                             String master_oid,
                             String linkitetyt_oidit) {}
    record ExportedHenkiloV3(String henkilo_oid,
                             String hetu,
                             String sukupuoli,
                             String syntymaaika,
                             String sukunimi,
                             String etunimet,
                             String aidinkieli,
                             boolean turvakielto,
                             String kotikunta,
                             boolean yksiloityvtj,
                             String kansalaisuus,
                             String master_oid,
                             String linkitetyt_oidit,
                             Timestamp created,
                             Timestamp updated) {
    }
    public record ExportedYhteystietoV2(String henkilo_oid,
                                        String yhteystietotyyppi,
                                        String yhteystieto_arvo,
                                        String yhteystieto_arvo_tyyppi,
                                        String alkupera) {}
    public record ExportedYhteystietoV3(String henkilo_oid,
                                        String yhteystietotyyppi,
                                        String yhteystieto_arvo,
                                        String yhteystieto_arvo_tyyppi,
                                        String alkupera) {}

}