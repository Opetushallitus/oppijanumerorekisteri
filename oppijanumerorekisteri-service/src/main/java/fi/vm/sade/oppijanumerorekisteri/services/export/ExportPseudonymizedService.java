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
public class ExportPseudonymizedService {
    private final JdbcTemplate jdbcTemplate;
    private static final String S3_PREFIX = "fulldump/oppijanumerorekisteri/v2";
    private final OppijanumerorekisteriProperties properties;


    @Transactional
    public void createSchema() {
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS pseudonymizednew CASCADE");
        jdbcTemplate.execute("CREATE SCHEMA pseudonymizednew");
        jdbcTemplate.execute("""
            CREATE TABLE pseudonymizednew.henkilo (
                henkilo_oid text PRIMARY KEY
            )
        """);
        jdbcTemplate.execute("""
            INSERT INTO pseudonymizednew.henkilo
            SELECT oidhenkilo FROM henkilo
        """);
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS pseudonymized CASCADE");
        jdbcTemplate.execute("ALTER SCHEMA pseudonymizednew RENAME TO pseudonymized");
    }


    public void generateExportFiles() {
        exportQueryToS3(S3_PREFIX + "/pseudonymized/henkilo.csv", "SELECT * FROM pseudonymized.henkilo");
    }

    private void exportQueryToS3(String objectKey, String query) {
        var bucketName = properties.getTasks().getExport().getBucketName();

        log.info("Exporting table to S3: {}/{}", bucketName, objectKey);
        var sql = "SELECT rows_uploaded FROM aws_s3.query_export_to_s3(?, aws_commons.create_s3_uri(?, ?, ?), options := 'FORMAT CSV, HEADER TRUE')";
        var rowsUploaded = jdbcTemplate.queryForObject(sql, Long.class, query, bucketName, objectKey, Region.EU_WEST_1.id());
        log.info("Exported {} rows to S3 object {}", rowsUploaded, objectKey);
    }
}