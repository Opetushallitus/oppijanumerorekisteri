package fi.vm.sade.oppijanumerorekisteri.services.datantuonti;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;

import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.impl.AwsSnsHenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;

@RunWith(SpringRunner.class)
@Sql("/sql/truncate_data.sql")
@Sql("/sql/test_data.sql")
@SpringBootTest
public class DatantuontiImportServiceTest {
    @Autowired
    private DatantuontiImportService importService;
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private HenkiloModificationService henkiloModificationService;
    @Autowired
    private HenkiloRepository henkiloRepository;
    @MockitoBean
    private AwsSnsHenkiloModifiedTopic snsTopic;
    @MockitoBean
    private KayttooikeusClient kayttooikeusClient;

    @Before
    public void insertDatantuonti() throws Exception {
        importService.createTableForDatantuontiData();
        jdbcTemplate.execute("""
            INSERT INTO datantuonti_henkilo_temp (
                oid,
                yksiloityvtj,
                aidinkieli,
                asiointikieli,
                kansalaisuus,
                master_oid,
                linkitetyt_oidit)
            VALUES
                ('1.2.2004.1', true, 'fi', 'fi', '368', null, '1.2.2004.2,1.2.2004.3'),
                ('1.2.2004.2', false, 'fi', 'sv', '368,246', '1.2.2004.1', null),
                ('1.2.2004.3', false, 'fi', 'sv', '368,246', '1.2.2004.1', null),
                ('1.2.2004.4', true, 'sv', 'sv', '368,246', null, null),
                ('1.2.2004.5', false, 'sv', 'fi', '368,246', '1.2.2004.4', null),
                ('1.2.2004.6', false, null, 'fi', '368', null, null),
                ('1.2.2004.7', false, 'fi', null, '368', null, null)
        """);
    }

    private Long getHenkiloCount() {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM henkilo", Long.class);
    }

    private String getAsiointikieli(String oid) {
        return jdbcTemplate.queryForObject("SELECT k.kielikoodi FROM kielisyys k LEFT JOIN henkilo h ON k.id = h.asiointikieli_id AND h.oidhenkilo = '" + oid + "' ORDER BY k.version DESC limit 1", String.class);
    }

    private String getAidinkieli(String oid) {
        var sql = """
                SELECT k.kielikoodi
                FROM henkilo h
                LEFT JOIN kielisyys k ON k.id = h.aidinkieli_id
                WHERE h.oidhenkilo = ? ORDER BY k.version DESC LIMIT 1
                """;
        return jdbcTemplate.queryForObject(sql, String.class, oid);
    }

    private List<String> getKansalaisuus(String oid) {
        var sql = """
            SELECT k.kansalaisuuskoodi
            FROM henkilo h
            LEFT JOIN henkilo_kansalaisuus hk ON h.id = hk.henkilo_id
            LEFT JOIN kansalaisuus k ON hk.kansalaisuus_id = k.id
            WHERE h.oidhenkilo = ?
            """;
        return jdbcTemplate.queryForList(sql, String.class, oid);
    }

    @Test
    public void createNewHenkiloCreatesNewHenkilosAndDoesntChangeExisting() throws Exception {
        Henkilo before = Henkilo.builder()
            .etunimet("Etu")
            .kutsumanimi("Etu")
            .sukunimi("Suku")
            .hetu("010107A939J")
            .oidHenkilo("1.2.2004.4")
            .asiointiKieli(new Kielisyys("fi"))
            .aidinkieli(new Kielisyys("fi"))
            .kansalaisuus(Set.of(new Kansalaisuus(Kansalaisuus.SUOMI)))
            .build();
        henkiloModificationService.createHenkilo(before, "kasittelia", false, before.getOidHenkilo());

        Long originalCount = getHenkiloCount();
        importService.createNewHenkilos();
        assertThat(getHenkiloCount()).isEqualTo(originalCount + 6);

        Henkilo after = henkiloRepository.findByOidHenkilo(before.getOidHenkilo()).get();
        assertThat(after)
            .returns(before.getOidHenkilo(), from(Henkilo::getOidHenkilo))
            .returns(before.getEtunimet(), from(Henkilo::getEtunimet))
            .returns(before.getKutsumanimi(), from(Henkilo::getKutsumanimi))
            .returns(before.getSukunimi(), from(Henkilo::getSukunimi))
            .returns(before.getHetu(), from(Henkilo::getHetu))
            .returns(before.isPassivoitu(), from(Henkilo::isPassivoitu));
        assertThat(getAidinkieli(after.getOidHenkilo())).isEqualTo("fi");
        assertThat(getAsiointikieli(after.getOidHenkilo())).isEqualTo("fi");
        assertThat(getKansalaisuus(after.getOidHenkilo())).containsExactlyInAnyOrder(Kansalaisuus.SUOMI);

        Henkilo eka = henkiloRepository.findByOidHenkilo("1.2.2004.1").get();
        assertThat(eka.getEtunimet()).matches(Pattern.compile(".* Testi"));
        assertThat(eka.getSukunimi()).matches(Pattern.compile(".*-Testi"));
        assertThat(eka.getHetu()).isNotBlank();
        assertThat(eka.isPassivoitu()).isFalse();
        assertThat(eka.isYksiloityVTJ()).isTrue();
        assertThat(eka.isYksiloity()).isFalse();
        assertThat(getAidinkieli(eka.getOidHenkilo())).isEqualTo("fi");
        assertThat(getAsiointikieli(eka.getOidHenkilo())).isEqualTo("fi");
        assertThat(getKansalaisuus(eka.getOidHenkilo())).containsExactlyInAnyOrder("368");

        Henkilo toka = henkiloRepository.findByOidHenkilo("1.2.2004.2").get();
        assertThat(toka.getEtunimet()).matches(Pattern.compile(".* Testi"));
        assertThat(toka.getSukunimi()).matches(Pattern.compile(".*-Testi"));
        assertThat(toka.getHetu()).isNull();
        assertThat(toka.isPassivoitu()).isTrue();
        assertThat(toka.isYksiloityVTJ()).isFalse();
        assertThat(toka.isYksiloity()).isFalse();
        assertThat(getAidinkieli(toka.getOidHenkilo())).isEqualTo("fi");
        assertThat(getKansalaisuus(toka.getOidHenkilo())).containsExactlyInAnyOrder("368", "246");
    }

    @Test
    public void createNewHenkiloLinksHenkilos() throws Exception {
        Henkilo before = Henkilo.builder()
            .etunimet("Etu")
            .kutsumanimi("Etu")
            .sukunimi("Suku")
            .hetu("010107A939J")
            .oidHenkilo("1.2.2004.4")
            .asiointiKieli(new Kielisyys("fi"))
            .aidinkieli(new Kielisyys("fi"))
            .kansalaisuus(Set.of(new Kansalaisuus(Kansalaisuus.SUOMI)))
            .build();
        henkiloModificationService.createHenkilo(before, "kasittelia", false, before.getOidHenkilo());

        Long originalCount = getHenkiloCount();
        importService.createNewHenkilos();
        assertThat(getHenkiloCount()).isEqualTo(originalCount + 6);

        List<HenkiloViite> links = jdbcTemplate.query("SELECT master_oid, slave_oid FROM henkiloviite",
            (rs, rn) -> new HenkiloViite(rs.getString("master_oid"), rs.getString("slave_oid")));
        assertThat(links).containsExactlyInAnyOrder(
            new HenkiloViite("1.2.2004.1", "1.2.2004.2"),
            new HenkiloViite("1.2.2004.1", "1.2.2004.3"),
            new HenkiloViite("1.2.2004.4", "1.2.2004.5")
        );
    }
}

record HenkiloViite(
    String masterOid,
    String slaveOid
) {};