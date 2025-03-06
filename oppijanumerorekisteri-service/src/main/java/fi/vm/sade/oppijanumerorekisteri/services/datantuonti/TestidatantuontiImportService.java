package fi.vm.sade.oppijanumerorekisteri.services.datantuonti;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import com.google.common.base.Optional;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import fi.vm.sade.oidgenerator.OIDGenerator;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.utils.VtjYhteystiedotRyhma;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static java.util.stream.Collectors.toSet;

import java.sql.Date;

@Service
@Slf4j
@RequiredArgsConstructor
public class TestidatantuontiImportService {
    private final NamedParameterJdbcTemplate namedJdbcTemplate;
    private final HenkiloModificationService henkiloModificationService;
    private final HenkiloService henkiloService;
    private final HenkiloRepository henkiloRepository;

    static final String NEW_HENKILO_QUERY = """
            SELECT
                d.hetu,
                d.etunimet,
                d.sukunimi,
                d.syntymaaika,
                d.kuolinpaiva,
                d.sukupuoli,
                d.turvakielto,
                d.kotikunta,
                d.aidinkieli,
                d.kansalaisuudet,
                d.huoltajat,
                d.katuosoite,
                d.postinumero,
                d.kaupunki
            FROM testidatantuonti_henkilo d
            LEFT JOIN henkilo ON d.hetu = henkilo.hetu
            WHERE henkilo.oidhenkilo IS NULL""";

    RowMapper<TestidatantuontiHenkilo> datantuontiHenkiloMapper = (rs, rn) -> new TestidatantuontiHenkilo(
        rs.getString("hetu"),
        rs.getString("etunimet"),
        rs.getString("sukunimi"),
        rs.getDate("syntymaaika"),
        rs.getDate("kuolinpaiva"),
        rs.getString("sukupuoli"),
        rs.getBoolean("turvakielto"),
        rs.getString("kotikunta"),
        rs.getString("aidinkieli"),
        rs.getString("kansalaisuudet") != null
            ? Arrays.asList(rs.getString("kansalaisuudet").split(","))
            : List.of(),
        rs.getString("huoltajat") != null
            ? Arrays.asList(rs.getString("huoltajat").split(","))
            : List.of(),
        rs.getString("katuosoite"),
        rs.getString("postinumero"),
        rs.getString("kaupunki")
    );

    public void createNewHenkilos() {
        try (Stream<TestidatantuontiHenkilo> newHenkilos = namedJdbcTemplate.queryForStream(
            NEW_HENKILO_QUERY,
            Map.of(),
            datantuontiHenkiloMapper
        )) {
            var savedHenkilos = newHenkilos
                .peek(d -> saveNewHenkilo(d))
                .toList();
            log.info("Testidatantuonti import saved {} new henkilos", savedHenkilos.size());
            savedHenkilos.stream().forEach(this::saveHuollettava);
        }
    }

    private String getFreePersonOid() {
        final String newOid = OIDGenerator.generateOID(98);
        if (this.henkiloService.getOidExists(newOid)) {
            return getFreePersonOid();
        }
        return newOid;
    }

    private Set<YhteystiedotRyhma> getYhteystiedotRyhmas(TestidatantuontiHenkilo d) {
        Set<YhteystiedotRyhma> ryhmat = new HashSet<>();
        if (!d.turvakielto() && d.katuosoite() != null && d.postinumero() != null && d.kaupunki() != null) {
            Set<Yhteystieto> yhteystiedot = new HashSet<>();
            yhteystiedot.add(Yhteystieto.builder(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE, d.katuosoite()).build());
            yhteystiedot.add(Yhteystieto.builder(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO, d.postinumero()).build());
            yhteystiedot.add(Yhteystieto.builder(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, d.kaupunki()).build());
            YhteystiedotRyhma yhteystiedotRyhma = new YhteystiedotRyhma(
                VtjYhteystiedotRyhma.VAKINAINEN_KOTIMAINEN_OSOITE.getKuvaus(),
                "alkupera1",
                true,
                yhteystiedot);
            ryhmat.add(yhteystiedotRyhma);
        }
        return ryhmat;
    }

    private Henkilo mapToHenkilo(TestidatantuontiHenkilo d) {
        return Henkilo.builder()
            .oidHenkilo(getFreePersonOid())
            .aidinkieli(Optional.fromNullable(d.aidinkieli()).transform(k -> new Kielisyys(k)).orNull())
            .asiointiKieli(Optional.fromNullable(d.aidinkieli()).transform(k -> new Kielisyys(k)).orNull())
            .yksiloityVTJ(true)
            .yksilointiYritetty(true)
            .yksiloity(false)
            .kansalaisuus(d.kansalaisuus().stream().map(k -> new Kansalaisuus(k)).collect(toSet()))
            .duplicate(false)
            .etunimet(d.etunimet())
            .kutsumanimi(d.etunimet())
            .sukunimi(d.sukunimi())
            .syntymaaika(d.syntymaaika().toLocalDate())
            .kuolinpaiva(d.kuolinpaiva() != null ? d.kuolinpaiva().toLocalDate() : null)
            .hetu(d.hetu())
            .sukupuoli(d.sukupuoli())
            .kotikunta(d.kotikunta())
            .turvakielto(d.turvakielto())
            .yhteystiedotRyhma(getYhteystiedotRyhmas(d))
            .build();
    }

    private void saveNewHenkilo(TestidatantuontiHenkilo d) {
        log.info("Saving new testihenkilo hetu {}", d.hetu());
        try {
            Henkilo h = mapToHenkilo(d);
            henkiloModificationService.createHenkilo(h, "testidatantuonti", false, h.getOidHenkilo());
        } catch (Exception e) {
            log.error("Failed to create new henkilo with hetu " + d.hetu(), e);
            throw e;
        }
    }

    private HuoltajaCreateDto getHuoltajaCreateDto(Henkilo h) {
        return HuoltajaCreateDto.builder()
            .etunimet(h.getEtunimet())
            .sukunimi(h.getSukunimi())
            .hetu(h.getHetu())
            .build();
    }

    private void saveHuollettava(TestidatantuontiHenkilo d) {
        if (d.huoltajat() == null || d.huoltajat().isEmpty()) {
            return;
        }

        Henkilo huollettava = henkiloRepository.findByHetu(d.hetu()).get();
        Set<HuoltajaCreateDto> huoltajat = d.huoltajat().stream()
                .map(h -> henkiloRepository.findByHetu(h))
                .filter(h -> h.isPresent())
                .map(h -> getHuoltajaCreateDto(h.get()))
                .collect(toSet());

        HenkiloForceUpdateDto updateDto = new HenkiloForceUpdateDto();
        updateDto.setOidHenkilo(huollettava.getOidHenkilo());
        updateDto.setHuoltajat(huoltajat);
        henkiloModificationService.forceUpdateHenkilo(updateDto);
    }
}

record TestidatantuontiHenkilo(
    String hetu,
    String etunimet,
    String sukunimi,
    Date syntymaaika,
    Date kuolinpaiva,
    String sukupuoli,
    boolean turvakielto,
    String kotikunta,
    String aidinkieli,
    List<String> kansalaisuus,
    List<String> huoltajat,
    String katuosoite,
    String postinumero,
    String kaupunki
) {};
