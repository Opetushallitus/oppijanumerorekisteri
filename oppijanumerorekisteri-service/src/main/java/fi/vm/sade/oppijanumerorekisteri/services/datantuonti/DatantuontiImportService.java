package fi.vm.sade.oppijanumerorekisteri.services.datantuonti;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.transfer.s3.S3TransferManager;
import software.amazon.awssdk.transfer.s3.model.DownloadFileRequest;

import static java.util.stream.Collectors.toSet;
import static fi.vm.sade.oppijanumerorekisteri.services.datantuonti.DatantuontiExportService.MANIFEST_OBJECT_KEY;

@Service
@Slf4j
@RequiredArgsConstructor
public class DatantuontiImportService {
    private final S3AsyncClient onrS3Client;
    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;
    private final ObjectMapper objectMapper;
    private final HenkiloModificationService henkiloModificationService;
    private final HenkiloRepository henkiloRepository;

    @Value("${oppijanumerorekisteri.tasks.datantuonti.import.bucket-name}")
    private String bucketName;

    static final String CREATE_DATANTUONTI_HENKILO = """
            CREATE TABLE IF NOT EXISTS datantuonti_henkilo_temp(
                oid text,
                yksiloityvtj boolean,
                aidinkieli text,
                asiointikieli text,
                kansalaisuus text,
                master_oid text,
                linkitetyt_oidit text
            )""";

    static final String NEW_HENKILO_QUERY = """
            SELECT
                d.oid,
                d.yksiloityvtj,
                d.aidinkieli,
                d.asiointikieli,
                d.kansalaisuus,
                d.master_oid,
                d.linkitetyt_oidit
            FROM datantuonti_henkilo_temp d
            LEFT JOIN henkilo ON d.oid = henkilo.oidhenkilo
            WHERE henkilo.oidhenkilo IS NULL""";

    public void importTempTableFromS3() throws IOException {
        DatantuontiManifest manifest = getManifest();

        log.info("Importing tables from S3");
        createTableForDatantuontiData();

        String henkiloSql = "SELECT * FROM aws_s3.table_import_from_s3('datantuonti_henkilo_temp', '',  '(FORMAT CSV,HEADER true)', aws_commons.create_s3_uri(?, ?, ?))";
        String henkiloTxt = jdbcTemplate.queryForObject(henkiloSql, String.class, bucketName, manifest.getHenkilo(), Region.EU_WEST_1.id());
        log.info("Importing datantuontihenkilot from S3 returned {}", henkiloTxt);
    }

    void createTableForDatantuontiData() {
        jdbcTemplate.execute("DROP TABLE IF EXISTS datantuonti_henkilo_temp");
        jdbcTemplate.execute(CREATE_DATANTUONTI_HENKILO);
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS datantuonti_henkilo_temp_oid_idx ON datantuonti_henkilo_temp(oid)");
    }

    RowMapper<DatantuontiHenkilo> datantuontiHenkiloMapper = (rs, rn) -> new DatantuontiHenkilo(
        rs.getString("oid"),
        rs.getBoolean("yksiloityvtj"),
        rs.getString("aidinkieli"),
        rs.getString("asiointikieli"),
        rs.getString("kansalaisuus") != null
            ? Arrays.asList(rs.getString("kansalaisuus").split(","))
            : List.of(),
        rs.getString("master_oid"),
        rs.getString("linkitetyt_oidit") != null
            ? Arrays.asList(rs.getString("linkitetyt_oidit").split(","))
            : List.of()
    );

    public void createNewHenkilos() {
        try (Stream<DatantuontiHenkilo> newHenkilos = namedJdbcTemplate.queryForStream(
            NEW_HENKILO_QUERY,
            Map.of(),
            datantuontiHenkiloMapper
        )) {
            DatantuontiHenkiloGenerator generator = new DatantuontiHenkiloGenerator();
            var savedHenkilos = newHenkilos
                .peek(d -> saveNewHenkilo(d, generator))
                .toList();
            savedHenkilos.stream().forEach(this::linkHenkilos);
        }
    }

    private Henkilo mapToHenkilo(DatantuontiHenkilo d, DatantuontiHenkiloGenerator generator) {
        GeneratedHenkilo generated = generateHenkiloWithUniqueHetu(d.yksiloityvtj(), generator);
        return Henkilo.builder()
            .oidHenkilo(d.oid())
            .aidinkieli(new Kielisyys(d.aidinkieli()))
            .asiointiKieli(new Kielisyys(d.asiointikieli()))
            .yksiloityVTJ(d.yksiloityvtj())
            .yksilointiYritetty(d.yksiloityvtj())
            .yksiloity(!d.yksiloityvtj() && d.masterOid() == null)
            .kansalaisuus(d.kansalaisuus().stream().map(k -> new Kansalaisuus(k)).collect(toSet()))
            .duplicate(d.masterOid() != null)
            .etunimet(generated.etunimet())
            .kutsumanimi(generated.kutsumanimi())
            .sukunimi(generated.sukunimi())
            .syntymaaika(generated.syntymaaika())
            .hetu(generated.hetu())
            .sukupuoli(generated.hetu() != null ? HetuUtils.sukupuoliFromHetu(generated.hetu()) : "2")
            .build();
    }

    private GeneratedHenkilo generateHenkiloWithUniqueHetu(boolean isVtjYksiloity, DatantuontiHenkiloGenerator generator) {
        while (true) {
            GeneratedHenkilo generated = generator.generateHenkilo(isVtjYksiloity);
            if (!isVtjYksiloity || henkiloRepository.findByHetu(generated.hetu()).isEmpty()) {
                return generated;
            }
        }
    }

    private void saveNewHenkilo(DatantuontiHenkilo d, DatantuontiHenkiloGenerator generator) {
        log.info("Saving new henkilo oid {}", d.oid());
        try {
            Henkilo h = mapToHenkilo(d, generator);
            henkiloModificationService.createHenkilo(h, "datantuonti", false, h.getOidHenkilo());
        } catch (Exception e) {
            log.error("Failed to create new henkilo with oid " + d.oid(), e);
            throw e;
        }
    }

    private void linkHenkilos(DatantuontiHenkilo d) {
        try {
            if (d.linkitetytOidit().size() > 0) {
                henkiloModificationService.forceLinkHenkilos(d.oid(), d.linkitetytOidit());
            }
            if (d.masterOid() != null) {
                henkiloModificationService.forceLinkHenkilos(d.masterOid(), List.of(d.oid()));
            }
        } catch (Exception e) {
            log.error("Failed to update henkiloviite for henkilo oid " + d.oid(), e);
            throw e;
        }
    }

    private DatantuontiManifest getManifest() throws IOException {
        @SuppressWarnings("java:S5443")
        var temporaryFile = File.createTempFile("export", ".csv");
        try {
            log.info("Downloading manifest from S3: {}/{}", bucketName, MANIFEST_OBJECT_KEY);
            try (var downloader = S3TransferManager.builder().s3Client(onrS3Client).build()) {
                var fileDownload = downloader.downloadFile(DownloadFileRequest.builder()
                        .getObjectRequest(b -> b.bucket(bucketName).key(MANIFEST_OBJECT_KEY))
                        .destination(temporaryFile)
                        .build());
                fileDownload.completionFuture().join();
                return objectMapper.readValue(temporaryFile, DatantuontiManifest.class);
            }
        } finally {
            Files.deleteIfExists(temporaryFile.toPath());
        }
    }
}

record DatantuontiHenkilo(
    String oid,
    boolean yksiloityvtj,
    String aidinkieli,
    String asiointikieli,
    List<String> kansalaisuus,
    String masterOid,
    List<String> linkitetytOidit
) {};
