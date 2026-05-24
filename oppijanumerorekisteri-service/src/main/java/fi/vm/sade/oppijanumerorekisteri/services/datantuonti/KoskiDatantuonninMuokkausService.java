package fi.vm.sade.oppijanumerorekisteri.services.datantuonti;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KotikuntaHistoriaRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class KoskiDatantuonninMuokkausService {

  static final String KOTIKUNTA_VEHMAA = "918";
  static final String KOTIKUNTA_ESPOO = "049";
  static final String KOTIKUNTA_JARVENPAA = "186";
  static final List<String> ACCEPTED_KOTIKUNTA =
      List.of(KOTIKUNTA_VEHMAA, KOTIKUNTA_ESPOO, KOTIKUNTA_JARVENPAA);

  static final String IMPORT_TABLE_NAME = "import.koski_datantuonti_henkilo_oids";
  static final int MAX_HETU_ATTEMPTS_PER_YEAR = 200;

  private final JdbcTemplate jdbcTemplate;
  private final TransactionTemplate transactionTemplate;
  private final HenkiloRepository henkiloRepository;
  private final KotikuntaHistoriaRepository kotikuntaHistoriaRepository;
  private final HenkiloModificationService henkiloModificationService;
  private final TestiHetuRandomizer testiHetuRandomizer = new TestiHetuRandomizer();

  public void run() {
    log.info("Running koski datantuonnin muokkaus task");
    processOids();
    log.info("Completed koski datantuonnin muokkaus task");
  }

  void processOids() {
    processOids(new SecureRandom());
  }

  void processOids(SecureRandom random) {
    var oids =
        jdbcTemplate.queryForList(
            "SELECT DISTINCT oid FROM %s WHERE processed IS NULL".formatted(IMPORT_TABLE_NAME),
            String.class);
    if (oids.isEmpty()) {
      log.info("No unprocessed oids in {}; nothing to do", IMPORT_TABLE_NAME);
      return;
    }
    log.info("Processing {} distinct unprocessed oids from koski source", oids.size());

    var ageSupply = buildSupply(oids.size(), ageProportions(), random);
    var kotikuntaSupply = buildSupply(oids.size(), kotikuntaProportions(), random);

    Set<String> usedHetus = new HashSet<>();
    List<String> unknownOids = new ArrayList<>();
    var henkilosUpdated = 0;
    var hetuExhausted = 0;
    var hetuCollisions = 0;

    for (String oid : oids) {
      var ageBucket = ageSupply.removeLast();
      var kotikuntaBucket = kotikuntaSupply.removeLast();
      var henkilo = henkiloRepository.findByOidHenkilo(oid).orElse(null);

      if (henkilo == null) {
        unknownOids.add(oid);
        markProcessed(oid);
        continue;
      }
      try {
        if (!tryToAdjustHetuAndKotikuntaForHenkilo(
            henkilo, ageBucket, kotikuntaBucket, random, usedHetus)) {
          hetuExhausted++;
        }
        henkilosUpdated++;
      } catch (DataIntegrityViolationException e) {
        log.info("Hetu collision for oid {}; will be retried next run", oid);
        hetuCollisions++;
      } catch (Exception e) {
        log.error(
            "Failed to adjust hetu and kotikunta for oid {}; will be retried next run", oid, e);
      }
    }

    log.info(
        "Koski datantuonnin muokkaus: updated {} henkilos (hetu unchanged for {} due to test-space exhaustion, {} collisions deferred to next run), missing {}",
        henkilosUpdated,
        hetuExhausted,
        hetuCollisions,
        unknownOids.size());
    if (!unknownOids.isEmpty()) {
      log.info("Unknown oids ({}): {}", unknownOids.size(), unknownOids);
    }
  }

  private boolean tryToAdjustHetuAndKotikuntaForHenkilo(
      Henkilo henkilo,
      AgeBucket ageBucket,
      KotikuntaBucket kotikuntaBucket,
      SecureRandom random,
      Set<String> usedHetus) {

    return transactionTemplate.execute(
        status -> {
          var newHetu = generateUniqueHetuInBucket(ageBucket, usedHetus, random);

          if (newHetu != null) {
            var dto = new HenkiloForceUpdateDto();
            dto.setOidHenkilo(henkilo.getOidHenkilo());
            dto.setHetu(newHetu);
            henkiloModificationService.forceUpdateHenkilo(dto);
            usedHetus.add(newHetu);

            var managed = henkiloRepository.findByOidHenkilo(henkilo.getOidHenkilo()).orElseThrow();

            applyKotikunta(managed, kotikuntaBucket, random);

            henkiloModificationService.update(managed);
            markProcessed(managed.getOidHenkilo());

            return true;
          } else {
            return false;
          }
        });
  }

  private static LinkedHashMap<AgeBucket, Double> ageProportions() {
    var proportions = new LinkedHashMap<AgeBucket, Double>();

    proportions.put(AgeBucket.CHILD, 0.96);
    proportions.put(AgeBucket.YOUNG_ADULT, 0.02);
    proportions.put(AgeBucket.ADULT, 0.02);

    return proportions;
  }

  private static LinkedHashMap<KotikuntaBucket, Double> kotikuntaProportions() {
    var proportions = new LinkedHashMap<KotikuntaBucket, Double>();

    proportions.put(KotikuntaBucket.KOTIKUNTA_VEHMAA, 0.32);
    proportions.put(KotikuntaBucket.KOTIKUNTA_ESPOO, 0.32);
    proportions.put(KotikuntaBucket.KOTIKUNTA_JARVENPAA, 0.32);
    proportions.put(KotikuntaBucket.MOVED_FROM_ABROAD, 0.02);
    proportions.put(KotikuntaBucket.CURRENTLY_ABROAD, 0.02);

    return proportions;
  }

  static <E extends Enum<E>> List<E> buildSupply(
      int total, LinkedHashMap<E, Double> proportions, SecureRandom random) {
    var counts = new LinkedHashMap<E, Integer>();
    var remainders = new LinkedHashMap<E, Double>();
    var assigned = 0;

    for (var entry : proportions.entrySet()) {
      var exact = total * entry.getValue();
      var floor = (int) Math.floor(exact);
      counts.put(entry.getKey(), floor);
      remainders.put(entry.getKey(), exact - floor);
      assigned += floor;
    }

    var leftover = total - assigned;

    if (leftover > 0) {
      var keysByRemainder =
          remainders.entrySet().stream()
              .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
              .map(Map.Entry::getKey)
              .toList();
      for (var i = 0; i < leftover; i++) {
        counts.merge(keysByRemainder.get(i), 1, Integer::sum);
      }
    }

    var supply = new ArrayList<E>(total);

    for (var entry : counts.entrySet()) {
      for (var i = 0; i < entry.getValue(); i++) {
        supply.add(entry.getKey());
      }
    }

    Collections.shuffle(supply, random);

    return supply;
  }

  private void markProcessed(String oid) {
    jdbcTemplate.update(
        "UPDATE %s SET processed = now() WHERE oid = ?".formatted(IMPORT_TABLE_NAME), oid);
  }

  enum AgeBucket {
    CHILD(8, 17),
    YOUNG_ADULT(18, 25),
    ADULT(26, 80);

    final int minAge;
    final int maxAge;

    AgeBucket(int minAge, int maxAge) {
      this.minAge = minAge;
      this.maxAge = maxAge;
    }
  }

  private String generateUniqueHetuInBucket(
      AgeBucket bucket, Set<String> usedHetus, SecureRandom random) {
    var currentYear = Year.now().getValue();
    var desiredAge = bucket.minAge + random.nextInt(bucket.maxAge - bucket.minAge + 1);
    var desiredYear = currentYear - desiredAge;
    var minYear = currentYear - bucket.maxAge;
    var maxYear = currentYear - bucket.minAge;

    for (int year : yearOrder(desiredYear, minYear, maxYear)) {
      for (int i = 0; i < MAX_HETU_ATTEMPTS_PER_YEAR; i++) {
        var dayOfYear = 1 + random.nextInt(Year.of(year).length());
        var birthDate = LocalDate.ofYearDay(year, dayOfYear);
        var hetu = testiHetuRandomizer.generateTestiHetu(random, birthDate);

        if (!usedHetus.contains(hetu) && henkiloRepository.findByHetu(hetu).isEmpty()) {
          return hetu;
        }
      }
    }

    return null;
  }

  static List<Integer> yearOrder(int desiredYear, int minYear, int maxYear) {
    var distance = 1;
    var total = maxYear - minYear + 1;

    List<Integer> order = new ArrayList<>();
    order.add(desiredYear);

    while (order.size() < total) {
      int below = desiredYear - distance;
      int above = desiredYear + distance;

      if (below >= minYear) {
        order.add(below);
      }

      if (above <= maxYear) {
        order.add(above);
      }

      distance++;
    }

    return order;
  }

  enum KotikuntaBucket {
    KOTIKUNTA_VEHMAA,
    KOTIKUNTA_ESPOO,
    KOTIKUNTA_JARVENPAA,
    MOVED_FROM_ABROAD,
    CURRENTLY_ABROAD
  }

  private void applyKotikunta(Henkilo henkilo, KotikuntaBucket bucket, SecureRandom random) {
    kotikuntaHistoriaRepository.deleteAllByHenkiloId(henkilo.getId());
    var birthDate = HetuUtils.dateFromHetu(henkilo.getHetu());

    switch (bucket) {
      case KOTIKUNTA_VEHMAA, KOTIKUNTA_ESPOO, KOTIKUNTA_JARVENPAA -> {
        var kunta = kuntaFor(bucket);
        henkilo.setKotikunta(kunta);
        kotikuntaHistoriaRepository.save(
            KotikuntaHistoria.builder()
                .henkiloId(henkilo.getId())
                .kotikunta(kunta)
                .kuntaanMuuttopv(birthDate)
                .kunnastaPoisMuuttopv(null)
                .build());
      }
      case MOVED_FROM_ABROAD -> {
        var kunta = ACCEPTED_KOTIKUNTA.get(random.nextInt(ACCEPTED_KOTIKUNTA.size()));
        var moveDate = pickMoveFromAbroadDate(birthDate, random);
        henkilo.setKotikunta(kunta);
        kotikuntaHistoriaRepository.save(
            KotikuntaHistoria.builder()
                .henkiloId(henkilo.getId())
                .kotikunta(kunta)
                .kuntaanMuuttopv(moveDate)
                .kunnastaPoisMuuttopv(null)
                .build());
      }
      case CURRENTLY_ABROAD -> {
        henkilo.setKotikunta(null);
      }
    }
  }

  private String kuntaFor(KotikuntaBucket bucket) {
    return switch (bucket) {
      case KOTIKUNTA_VEHMAA -> KOTIKUNTA_VEHMAA;
      case KOTIKUNTA_ESPOO -> KOTIKUNTA_ESPOO;
      case KOTIKUNTA_JARVENPAA -> KOTIKUNTA_JARVENPAA;
      default -> throw new IllegalArgumentException(bucket.name());
    };
  }

  private LocalDate pickMoveFromAbroadDate(LocalDate birthDate, SecureRandom random) {
    var earliest = birthDate.plusYears(1);
    var eighteenth = birthDate.plusYears(18);
    var today = LocalDate.now();
    var latest = today.isBefore(eighteenth) ? today : eighteenth;

    if (latest.isBefore(earliest)) {
      return earliest;
    }

    var span = latest.toEpochDay() - earliest.toEpochDay();

    return earliest.plusDays(random.nextInt((int) Math.min(span, Integer.MAX_VALUE)));
  }
}
