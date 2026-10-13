package fi.vm.sade.oppijanumerorekisteri.services.export;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;
import java.util.regex.Pattern;

import fi.vm.sade.oppijanumerorekisteri.services.datantuonti.DatantuontiExportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DatantuontiExportServiceTest {
    private static final String BUCKET = "lampi-test-bucket";
    private static final String KMS_KEY_ARN = "arn:aws:kms:eu-west-1:123456789012:key/test-key";
    private static final String MANIFEST_JSON = "{\"test\":\"manifest\"}";

    @Mock
    private JdbcTemplate jdbcTemplate;
    @Mock
    private S3AsyncClient onrS3Client;
    @Mock
    private ObjectMapper objectMapper;
    @Captor
    private ArgumentCaptor<Consumer<PutObjectRequest.Builder>> putObjectRequest;

    private DatantuontiExportService service;

    @BeforeEach
    void setUp() {
        service = new DatantuontiExportService();
        ReflectionTestUtils.setField(service, "jdbcTemplate", jdbcTemplate);
        ReflectionTestUtils.setField(service, "onrS3Client", onrS3Client);
        ReflectionTestUtils.setField(service, "objectMapper", objectMapper);
        ReflectionTestUtils.setField(service, "bucketName", BUCKET);
        ReflectionTestUtils.setField(service, "kmsKeyArn", KMS_KEY_ARN);
    }

    @Test
    void createSchemaIncludesSeparateIdentificationColumns() {
        service.createSchema();

        var statements = ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate, atLeastOnce()).execute(statements.capture());
        var createTableSql = statements.getAllValues().stream()
                .filter(sql -> sql.stripLeading().startsWith("CREATE TABLE datantuonti_export_new.henkilo"))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Export table was not created"));

        // The commas matter: without one, the next column can become an alias.
        var identificationColumns = Pattern.compile("""
                \\bSELECT\\s+h\\.oidhenkilo\\s+AS\\s+oid\\s*,\\s*
                h\\.yksiloityvtj\\s*,\\s*
                h\\.yksiloity\\s*,\\s*
                h\\.yksiloityeidas\\s*,\\s*
                aidinkieli\\.kielikoodi\\s+AS\\s+aidinkieli\\s*,
                """, Pattern.CASE_INSENSITIVE | Pattern.COMMENTS);
        assertTrue(identificationColumns.matcher(createTableSql).find(),
                "Expected distinct identification columns followed by aidinkieli: " + createTableSql);
    }

    @Test
    void generateExportFilesExportsExpectedColumnsAndWritesManifest() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class),
                anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(2L);
        when(objectMapper.writeValueAsString(any())).thenReturn(MANIFEST_JSON);
        when(onrS3Client.putObject(
                org.mockito.ArgumentMatchers.<Consumer<PutObjectRequest.Builder>>any(),
                any(AsyncRequestBody.class)))
                .thenReturn(CompletableFuture.completedFuture(PutObjectResponse.builder().build()));

        service.generateExportFiles();

        var exportSql = ArgumentCaptor.forClass(String.class);
        var query = ArgumentCaptor.forClass(String.class);
        var csvObjectKey = ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate).queryForObject(exportSql.capture(), eq(Long.class),
                query.capture(), eq(BUCKET), csvObjectKey.capture(), eq("eu-west-1"), eq(KMS_KEY_ARN));

        var projection = Pattern.compile(
                        "(?is)\\bSELECT\\s+(.*?)\\s+FROM\\s+datantuonti_export\\.henkilo\\s*;?\\s*$")
                .matcher(query.getValue());
        assertTrue(projection.find(), "Expected a query of the export snapshot: " + query.getValue());
        var columns = Arrays.stream(projection.group(1).split(","))
                .map(String::trim)
                .toList();
        assertEquals(List.of("oid", "yksiloityvtj", "yksiloity", "yksiloityeidas",
                        "aidinkieli", "asiointikieli", "kansalaisuus", "master_oid", "linkitetyt_oidit"),
                columns);
        assertTrue(exportSql.getValue().contains("aws_s3.query_export_to_s3"));
        assertTrue(exportSql.getValue().contains("FORMAT CSV, HEADER TRUE"));
        assertTrue(exportSql.getValue().contains("kms_key := ?"));
        assertTrue(csvObjectKey.getValue().matches(
                "oppijanumerorekisteri/v1/csv/henkilo-\\d+\\.csv"));

        var manifest = ArgumentCaptor.forClass(Object.class);
        verify(objectMapper).writeValueAsString(manifest.capture());
        verify(onrS3Client).putObject(putObjectRequest.capture(), any(AsyncRequestBody.class));
        var requestBuilder = PutObjectRequest.builder();
        putObjectRequest.getValue().accept(requestBuilder);
        var request = requestBuilder.build();
        assertEquals(BUCKET, request.bucket());
        assertEquals("oppijanumerorekisteri/v1/manifest.json", request.key());
    }
}
