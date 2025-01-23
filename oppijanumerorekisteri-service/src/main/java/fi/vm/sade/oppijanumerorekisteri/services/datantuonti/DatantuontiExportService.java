package fi.vm.sade.oppijanumerorekisteri.services.datantuonti;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.ServerSideEncryption;

import java.util.Date;

@Slf4j
@Service
public class DatantuontiExportService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private S3AsyncClient onrS3Client;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private OppijanumerorekisteriProperties properties;

    private final static String V1_PREFIX = "oppijanumerorekisteri/v1";
    public final static String MANIFEST_OBJECT_KEY = V1_PREFIX + "/manifest.json";
    private final String CREATE_HENKILO_SQL = """
        CREATE TABLE datantuonti_export_new.henkilo_temp AS
          SELECT
            h.oidhenkilo AS oid,
            h.yksiloityvtj,
            aidinkieli.kielikoodi AS aidinkieli,
            asiointikieli.kielikoodi AS asiointikieli,
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
            ) AS linkitetyt_oidit
          FROM henkilo h
          LEFT JOIN kielisyys aidinkieli ON h.aidinkieli_id = aidinkieli.id
          LEFT JOIN kielisyys asiointikieli ON h.asiointikieli_id = asiointikieli.id;
    """;
    private final String HENKILO_QUERY = """
        SELECT
          oid,
          yksiloityvtj,
          aidinkieli,
          asiointikieli,
          kansalaisuus,
          master_oid,
          linkitetyt_oidit
        FROM datantuonti_export.henkilo
    """;

    @Transactional
    public void createSchema() {
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS datantuonti_export_new CASCADE");
        jdbcTemplate.execute("CREATE SCHEMA datantuonti_export_new");
        jdbcTemplate.execute(CREATE_HENKILO_SQL);
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS datantuonti_export CASCADE");
        jdbcTemplate.execute("ALTER SCHEMA datantuonti_export_new RENAME TO datantuonti_export");
    }

    public void generateExportFiles() throws JsonProcessingException {
        var timestamp = new Date().getTime();
        var henkiloObjectKey = V1_PREFIX + "/csv/henkilo-" + timestamp + ".csv";
        exportQueryToS3(henkiloObjectKey, HENKILO_QUERY);
        reEncryptFile(henkiloObjectKey);
        writeManifest(MANIFEST_OBJECT_KEY, new DatantuontiManifest(henkiloObjectKey));
    }

    private void exportQueryToS3(String objectKey, String query) {
        log.info("Exporting table to S3: {}/{}", bucketName(), objectKey);
        var sql = "SELECT rows_uploaded FROM aws_s3.query_export_to_s3(?, aws_commons.create_s3_uri(?, ?, ?), options := 'FORMAT CSV, HEADER TRUE')";
        var rowsUploaded = jdbcTemplate.queryForObject(sql, Long.class, query, bucketName(), objectKey, Region.EU_WEST_1.id());
        log.info("Exported {} rows to S3 object {}", rowsUploaded, objectKey);
    }

    private String bucketName() {
        return properties.getTasks().getDatantuonti().getExport().getBucket();
    }

    private void writeManifest(String objectKey, DatantuontiManifest manifest) throws JsonProcessingException {
        log.info("Writing manifest file {}/{}: {}", bucketName(), objectKey, manifest);
        var manifestJson = objectMapper.writeValueAsString(manifest);
        var response = onrS3Client.putObject(
                b -> b.bucket(bucketName()).key(objectKey),
                AsyncRequestBody.fromString(manifestJson)
        ).join();
        log.info("Wrote manifest to S3: {}", response);
    }

    private void reEncryptFile(String objectKey) {
        log.info("Re-encrypting {}/{} with custom key {}", bucketName(), objectKey, encryptionKeyArn());
        CopyObjectRequest request = CopyObjectRequest.builder()
                .sourceBucket(bucketName())
                .destinationBucket(bucketName())
                .sourceKey(objectKey)
                .destinationKey(objectKey)
                .ssekmsKeyId(encryptionKeyArn())
                .serverSideEncryption(ServerSideEncryption.AWS_KMS)
                .build();
        onrS3Client.copyObject(request).join();
        log.info("{}/{} re-encrypted with custom key {}", bucketName(), objectKey, encryptionKeyArn());
    }

    private String encryptionKeyArn() {
        return properties.getTasks().getDatantuonti().getExport().getEnccryptionKeyArn();
    }
}
