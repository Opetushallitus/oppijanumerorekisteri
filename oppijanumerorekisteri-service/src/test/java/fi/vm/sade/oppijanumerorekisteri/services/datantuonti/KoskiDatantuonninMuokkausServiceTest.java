package fi.vm.sade.oppijanumerorekisteri.services.datantuonti;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.impl.AwsSnsHenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KotikuntaHistoriaRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.Year;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

@Sql("/sql/truncate_data.sql")
@Sql("/sql/test_data.sql")
@SpringBootTest
class KoskiDatantuonninMuokkausServiceTest {
  static final String KOTIKUNTA_HELSINKI = "091";
  static final String KOTIKUNTA_VEHMAA = "918";
  static final String KOTIKUNTA_ESPOO = "049";
  static final String KOTIKUNTA_JARVENPAA = "186";

  @Autowired private KoskiDatantuonninMuokkausService service;
  @Autowired private JdbcTemplate jdbcTemplate;
  @Autowired private HenkiloModificationService henkiloModificationService;
  @Autowired private HenkiloRepository henkiloRepository;
  @Autowired private KotikuntaHistoriaRepository kotikuntaHistoriaRepository;

  @MockitoBean private AwsSnsHenkiloModifiedTopic snsTopic;
  @MockitoBean private KayttooikeusClient kayttooikeusClient;

  @BeforeEach
  void setUp() {
    jdbcTemplate.execute("TRUNCATE TABLE " + KoskiDatantuonninMuokkausService.IMPORT_TABLE_NAME);
  }

  @Test
  void randomizesHetuKotikuntaAndReplacesKotikuntahistoria() {
    var seeded = seedHenkilo("1.2.koski.1", "010107A939J", "Etu");
    kotikuntaHistoriaRepository.save(
        KotikuntaHistoria.builder()
            .henkiloId(seeded.getId())
            .kotikunta(KOTIKUNTA_HELSINKI)
            .kuntaanMuuttopv(LocalDate.of(2010, 1, 1))
            .build());

    insertOids("1.2.koski.1");

    service.processOids(new SeededSecureRandom(1L));

    var after = henkiloRepository.findByOidHenkilo("1.2.koski.1").orElseThrow();
    assertThat(after.getHetu()).isNotEqualTo("010107A939J");
    assertThat(HetuUtils.hetuIsValid(after.getHetu())).isTrue();
    assertThat(after.getHetu().charAt(7)).isEqualTo('9');
    assertThat(after.getEtunimet()).isEqualTo("Etu");
    assertThat(after.getSukunimi()).isEqualTo("Suku");

    List<KotikuntaHistoria> history = kotikuntaHistoriaRepository.findAllByHenkiloId(after.getId());
    assertThat(history)
        .as("history does not contain Helsinki")
        .allSatisfy(row -> assertThat(row.getKotikunta()).isNotEqualTo(KOTIKUNTA_HELSINKI));
  }

  @Test
  void missingOidsAreSkippedAndDoNotFailRun() {
    seedHenkilo("1.2.koski.real", "010107A939J", "Etu");
    insertOids("1.2.koski.real", "1.2.koski.MISSING");

    service.processOids(new SeededSecureRandom(2L));

    assertThat(henkiloRepository.findByOidHenkilo("1.2.koski.MISSING")).isEmpty();
    assertThat(henkiloRepository.findByOidHenkilo("1.2.koski.real")).isPresent();
  }

  @Test
  void distributionMatchesSpecification() {
    var totalHenkiloCount = 1000;

    for (int i = 0; i < totalHenkiloCount; i++) {
      seedHenkilo("1.2.koski.dist." + i, null, "Henkilo" + i);
      insertOids("1.2.koski.dist." + i);
    }

    service.processOids(new SeededSecureRandom(7L));

    var currentYear = Year.now().getValue();
    var seen = new HashSet<String>();

    var vehmaaCount = 0;
    var espooCount = 0;
    var jarvenpaaCount = 0;
    var movedFromAbroadCount = 0;
    var currentlyAbroadCount = 0;
    var ages8to17 = 0;
    var ages18to25 = 0;
    var ages26plus = 0;

    for (int i = 0; i < totalHenkiloCount; i++) {
      var henkilo = henkiloRepository.findByOidHenkilo("1.2.koski.dist." + i).orElseThrow();

      assertThat(henkilo.getHetu()).isNotNull();
      assertThat(seen.add(henkilo.getHetu()))
          .as("hetu collision for %s: %s", henkilo.getOidHenkilo(), henkilo.getHetu())
          .isTrue();

      var history = kotikuntaHistoriaRepository.findAllByHenkiloId(henkilo.getId());
      var birthDate = HetuUtils.dateFromHetu(henkilo.getHetu());

      if (henkilo.getKotikunta() == null) {
        assertThat(history).as("CURRENTLY_ABROAD bucket must leave no kotikuntahistoria").isEmpty();
        currentlyAbroadCount++;
      } else {
        assertThat(history).hasSize(1);
        var row = history.getFirst();

        if (row.getKuntaanMuuttopv().equals(birthDate)) {
          switch (henkilo.getKotikunta()) {
            case KOTIKUNTA_VEHMAA -> vehmaaCount++;
            case KOTIKUNTA_ESPOO -> espooCount++;
            case KOTIKUNTA_JARVENPAA -> jarvenpaaCount++;
            default -> fail("unexpected kotikunta: " + henkilo.getKotikunta());
          }
        } else {
          movedFromAbroadCount++;
        }
      }

      var age = currentYear - birthDate.getYear();
      if (age <= 17) {
        ages8to17++;
      } else if (age <= 25) {
        ages18to25++;
      } else {
        ages26plus++;
      }
    }

    assertThat(vehmaaCount)
        .as("32% have kotikunta Vehmaa")
        .isEqualTo((int) (totalHenkiloCount * 0.32));
    assertThat(espooCount)
        .as("32% have kotikunta Espoo")
        .isEqualTo((int) (totalHenkiloCount * 0.32));
    assertThat(jarvenpaaCount)
        .as("32% have kotikunta Järvenpää")
        .isEqualTo((int) (totalHenkiloCount * 0.32));
    assertThat(movedFromAbroadCount)
        .as("2% have moved from abroad")
        .isEqualTo((int) (totalHenkiloCount * 0.02));
    assertThat(currentlyAbroadCount)
        .as("2% currently live abroad")
        .isEqualTo((int) (totalHenkiloCount * 0.02));

    assertThat(ages8to17).as("96% turn 8-17 this year").isEqualTo((int) (totalHenkiloCount * 0.96));
    assertThat(ages18to25)
        .as("2% turn 18-25 this year")
        .isEqualTo((int) (totalHenkiloCount * 0.02));
    assertThat(ages26plus).as("2% turn 26+ this year").isEqualTo((int) (totalHenkiloCount * 0.02));
  }

  private Henkilo seedHenkilo(String oid, String hetu, String etunimet) {
    var henkilo =
        Henkilo.builder()
            .etunimet(etunimet)
            .kutsumanimi(etunimet)
            .sukunimi("Suku")
            .hetu(hetu)
            .oidHenkilo(oid)
            .asiointiKieli(new Kielisyys("fi"))
            .aidinkieli(new Kielisyys("fi"))
            .kansalaisuus(Set.of(new Kansalaisuus(Kansalaisuus.SUOMI)))
            .kotikunta(KOTIKUNTA_HELSINKI)
            .build();
    return henkiloModificationService.createHenkilo(
        henkilo, "kasittelija", false, henkilo.getOidHenkilo());
  }

  private void insertOids(String... oids) {
    for (String oid : oids) {
      jdbcTemplate.update(
          "INSERT INTO %s(oid) VALUES (?)"
              .formatted(KoskiDatantuonninMuokkausService.IMPORT_TABLE_NAME),
          oid);
    }
  }
}

class SeededSecureRandom extends SecureRandom {
  private final Random delegate;

  SeededSecureRandom(long seed) {
    this.delegate = new Random(seed);
  }

  @Override
  public int nextInt(int bound) {
    return delegate.nextInt(bound);
  }

  @Override
  public int nextInt(int origin, int bound) {
    return delegate.nextInt(origin, bound);
  }

  @Override
  public long nextLong(long origin, long bound) {
    return delegate.nextLong(origin, bound);
  }

  @Override
  public void nextBytes(byte[] bytes) {
    delegate.nextBytes(bytes);
  }
}
