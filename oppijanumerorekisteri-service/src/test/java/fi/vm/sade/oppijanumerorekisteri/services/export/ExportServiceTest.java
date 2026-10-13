package fi.vm.sade.oppijanumerorekisteri.services.export;

import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Answers;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExportServiceTest {
    private static final String BUCKET = "lampi-test-bucket";
    private static final String LAMPI_BUCKET = "lampi-destination-bucket";
    private static final String PREFIX_V3 = "fulldump/oppijanumerorekisteri/v3";
    private static final String PREFIX_V4 = "fulldump/oppijanumerorekisteri/v4";

    @Mock
    private JdbcTemplate jdbcTemplate;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private OppijanumerorekisteriProperties properties;
    @Mock
    private S3AsyncClient onrS3Client;
    @Mock
    private S3AsyncClient lampiS3Client;
    @Captor
    private ArgumentCaptor<Consumer<PutObjectRequest.Builder>> manifestRequest;

    private ExportService service;

    @BeforeEach
    void setUp() {
        service = new ExportService(jdbcTemplate, properties, onrS3Client, lampiS3Client);
    }

    @Test
    void createSchemaIncludesSeparateIdentificationColumns() {
        service.createSchema();

        var statements = ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate, atLeastOnce()).execute(statements.capture());
        var createTableSql = statements.getAllValues().stream()
                .filter(sql -> sql.stripLeading().startsWith("CREATE TABLE exportnew.henkilo"))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Export table was not created"));

        var oneLineSql = String.join(" ", createTableSql.lines().map(String::strip).toList());
        assertTrue(oneLineSql.contains(
                        "h.yksiloityvtj, h.yksiloity, h.yksiloityeidas, (SELECT"),
                "Expected three separate identification columns: " + createTableSql);
    }

    @Test
    void csvExportsSelectIdentificationColumnsInBothVersions() {
        when(properties.getTasks().getExport().getBucketName()).thenReturn(BUCKET);
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class),
                anyString(), anyString(), anyString(), anyString())).thenReturn(2L);

        service.generateCsvExportsV3();
        service.generateCsvExportsV4();

        var exportSql = ArgumentCaptor.forClass(String.class);
        var queries = ArgumentCaptor.forClass(String.class);
        var keys = ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate, times(4)).queryForObject(
                exportSql.capture(), eq(Long.class), queries.capture(),
                eq(BUCKET), keys.capture(), eq("eu-west-1"));

        assertEquals(List.of(
                PREFIX_V3 + "/csv/henkilo.csv",
                PREFIX_V3 + "/csv/yhteystieto.csv",
                PREFIX_V4 + "/csv/henkilo.csv",
                PREFIX_V4 + "/csv/yhteystieto.csv"
        ), keys.getAllValues());

        assertColumns(queries.getAllValues().get(0), List.of(
                "henkilo_oid", "hetu", "sukupuoli", "syntymaaika", "sukunimi",
                "etunimet", "aidinkieli", "turvakielto", "kotikunta", "yksiloityvtj",
                "yksiloity", "yksiloityeidas", "kansalaisuus", "master_oid",
                "linkitetyt_oidit", "created", "updated"));
        assertEquals("SELECT * FROM export.yhteystieto", queries.getAllValues().get(1));
        assertColumns(queries.getAllValues().get(2), List.of(
                "henkilo_oid", "hetu", "eidas_tunnisteet", "sukupuoli", "syntymaaika",
                "sukunimi", "etunimet", "aidinkieli", "turvakielto", "kotikunta",
                "yksiloityvtj", "yksiloity", "yksiloityeidas", "kansalaisuus",
                "master_oid", "linkitetyt_oidit", "created", "updated"));
        assertEquals("SELECT * FROM export.yhteystieto", queries.getAllValues().get(3));

        for (var sql : exportSql.getAllValues()) {
            assertTrue(sql.contains("aws_s3.query_export_to_s3"));
            assertTrue(sql.contains("options := 'FORMAT CSV, HEADER TRUE'"));
        }
    }

    @Test
    void manifestIsWrittenToLampiBucket() {
        when(properties.getTasks().getExport().getLampiBucketName()).thenReturn(LAMPI_BUCKET);
        when(lampiS3Client.putObject(
                org.mockito.ArgumentMatchers.<Consumer<PutObjectRequest.Builder>>any(),
                any(AsyncRequestBody.class)))
                .thenReturn(CompletableFuture.completedFuture(PutObjectResponse.builder().build()));

        // Manifests are written during copyExportFilesToLampi(), not CSV generation.
        // Exercise the manifest writer directly to avoid S3 Transfer Manager downloads.
        ReflectionTestUtils.invokeMethod(service, "writeManifest",
                PREFIX_V4 + "/csv/manifest.json", new ExportManifest(List.of()));

        verify(lampiS3Client).putObject(manifestRequest.capture(), any(AsyncRequestBody.class));
        var builder = PutObjectRequest.builder();
        manifestRequest.getValue().accept(builder);
        var request = builder.build();
        assertEquals(LAMPI_BUCKET, request.bucket());
        assertEquals(PREFIX_V4 + "/csv/manifest.json", request.key());
    }

    private static void assertColumns(String query, List<String> expectedColumns) {
        var lines = query.lines().map(String::strip).toList();
        assertEquals("SELECT", lines.getFirst());
        assertEquals("FROM export.henkilo", lines.getLast());
        var columns = lines.subList(1, lines.size() - 1).stream()
                .map(line -> line.endsWith(",") ? line.substring(0, line.length() - 1) : line)
                .toList();
        assertEquals(expectedColumns, columns);
    }
}