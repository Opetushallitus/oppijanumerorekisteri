package fi.vm.sade.oppijanumerorekisteri.services;

import static org.assertj.core.api.Assertions.assertThat;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Date;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import org.hibernate.envers.RevisionType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Sql("/sql/truncate_data.sql")
@SpringBootTest
class AuditTablesTest {
  private static final int FIVE_YEARS_IN_DAYS = 5 * 365;

  @Autowired private AuditCleanupService auditCleanupService;
  @Autowired private JdbcTemplate jdbcTemplate;
  @Autowired private PlatformTransactionManager transactionManager;
  @PersistenceContext private EntityManager em;

  @Test
  void auditTablesArePopulatedOnInsert() {
    assertThatHenkiloAuditTablesAreEmpty();

    var persistedEntities = createHuollettavaHenkiloAndHuoltajaHenkilo();

    assertThatHenkiloAuditTablesContainDataFor(persistedEntities.huollettavaHenkilo());
    assertThatHenkiloAuditTablesContainDataFor(persistedEntities.huoltajaHenkilo());
    assertThatHenkloHuoltajaSuhdeAuditTableContainsDataFor(
        persistedEntities.henkiloHuoltajaSuhde());
  }

  @Test
  void auditTablesArePopulatedOnUpdate() {
    assertThatHenkiloAuditTablesAreEmpty();

    var persistedEntities = createHuollettavaHenkiloAndHuoltajaHenkilo();
    var updatedEntities = updateHuollettavaHenkiloAndHuoltajaHenkilo(persistedEntities);
    var revision = latestRevision();

    assertThatHenkiloAuditTablesContainUpdateFor(revision, updatedEntities.huollettavaHenkilo());
    assertThatHenkiloAuditTablesContainUpdateFor(revision, updatedEntities.huoltajaHenkilo());
    assertThatHenkiloHuoltajaSuhdeAuditTableContainsUpdateFor(
        revision, updatedEntities.henkiloHuoltajaSuhde());
  }

  @Test
  void auditTablesArePrunedOfDataOlderThanFiveYears() {
    createHuollettavaHenkiloAndHuoltajaHenkilo();
    var oldRevision = latestRevision();
    createHuollettavaHenkiloAndHuoltajaHenkilo();
    var newRevision = latestRevision();

    assertThat(oldRevision).isLessThan(newRevision);
    assertThatHenkiloAuditTablesContainRowsForRevision(oldRevision);
    assertThatHenkiloAuditTablesContainRowsForRevision(newRevision);

    ageRevision(oldRevision, Duration.ofDays(FIVE_YEARS_IN_DAYS + 1));
    auditCleanupService.cleanup();

    assertThatHenkiloAuditTablesAreEmptyForRevision(oldRevision);
    assertThatHenkiloAuditTablesContainRowsForRevision(newRevision);
  }

  @Test
  void auditTablesRetainDataLessThanFiveYearsOld() {
    createHuollettavaHenkiloAndHuoltajaHenkilo();
    var revision = latestRevision();

    ageRevision(revision, Duration.ofDays(FIVE_YEARS_IN_DAYS - 1));
    auditCleanupService.cleanup();

    assertThatHenkiloAuditTablesContainRowsForRevision(revision);
  }

  private void assertThatHenkiloAuditTablesAreEmpty() {
    assertThat(jdbcTemplate.queryForList("SELECT * FROM henkilo_aud")).isEmpty();
    assertThat(jdbcTemplate.queryForList("SELECT * FROM henkilo_kansalaisuus_aud")).isEmpty();
    assertThat(jdbcTemplate.queryForList("SELECT * FROM henkilo_organisaatio_aud")).isEmpty();
    assertThat(jdbcTemplate.queryForList("SELECT * FROM henkilo_passinumero_aud")).isEmpty();
    assertThat(jdbcTemplate.queryForList("SELECT * FROM henkilo_huoltaja_suhde_aud")).isEmpty();
    assertThat(jdbcTemplate.queryForList("SELECT * FROM revinfo")).isEmpty();
  }

  private PersistedEntities createHuollettavaHenkiloAndHuoltajaHenkilo() {
    return new TransactionTemplate(transactionManager)
        .execute(
            status -> {
              var kielisyys = createKielisyys();
              var organisaatio = createOrganisaatio();
              var huollettavaHenkilo = createHenkilo(organisaatio, kielisyys);
              var huoltajaHenkilo = createHenkilo(organisaatio, kielisyys);
              var henkiloHuoltajaSuhde =
                  createHenkiloHuoltajaSuhde(huollettavaHenkilo, huoltajaHenkilo);

              return new PersistedEntities(
                  huollettavaHenkilo, huoltajaHenkilo, henkiloHuoltajaSuhde);
            });
  }

  private void assertThatHenkloHuoltajaSuhdeAuditTableContainsDataFor(
      HenkiloHuoltajaSuhde henkiloHuoltajaSuhde) {
    var suhdeRow =
        jdbcTemplate.queryForMap(
            "SELECT id, lapsi_id, huoltaja_id, revtype FROM henkilo_huoltaja_suhde_aud");
    assertThat(suhdeRow.get("id")).isEqualTo(henkiloHuoltajaSuhde.getId());
    assertThat(suhdeRow.get("lapsi_id")).isEqualTo(henkiloHuoltajaSuhde.getLapsi().getId());
    assertThat(suhdeRow.get("huoltaja_id")).isEqualTo(henkiloHuoltajaSuhde.getHuoltaja().getId());
    assertThat(revisionTypeOf(suhdeRow)).isEqualTo(RevisionType.ADD);
  }

  private void assertThatHenkiloAuditTablesContainDataFor(Henkilo henkilo) {
    var henkiloRow =
        jdbcTemplate.queryForMap(
            "SELECT id, oidhenkilo, etunimet, kutsumanimi, sukunimi, revtype"
                + " FROM henkilo_aud WHERE id = ?",
            henkilo.getId());
    assertThat(henkiloRow.get("oidhenkilo")).isEqualTo(henkilo.getOidHenkilo());
    assertThat(henkiloRow.get("etunimet")).isEqualTo(henkilo.getEtunimet());
    assertThat(henkiloRow.get("kutsumanimi")).isEqualTo(henkilo.getKutsumanimi());
    assertThat(henkiloRow.get("sukunimi")).isEqualTo(henkilo.getSukunimi());
    assertThat(revisionTypeOf(henkiloRow)).isEqualTo(RevisionType.ADD);

    var kansalaisuusRow =
        jdbcTemplate.queryForMap(
            "SELECT kansalaisuus_id, revtype FROM henkilo_kansalaisuus_aud WHERE henkilo_id = ?",
            henkilo.getId());
    assertThat(kansalaisuusRow.get("kansalaisuus_id"))
        .isIn(henkilo.getKansalaisuus().stream().map(Kansalaisuus::getId).toList());
    assertThat(revisionTypeOf(kansalaisuusRow)).isEqualTo(RevisionType.ADD);

    var organisaatioRow =
        jdbcTemplate.queryForMap(
            "SELECT organisaatio_id, revtype FROM henkilo_organisaatio_aud WHERE henkilo_id = ?",
            henkilo.getId());
    assertThat(organisaatioRow.get("organisaatio_id"))
        .isIn(henkilo.getOrganisaatiot().stream().map(Organisaatio::getId).toList());
    assertThat(revisionTypeOf(organisaatioRow)).isEqualTo(RevisionType.ADD);

    var passinumeroRow =
        jdbcTemplate.queryForMap(
            "SELECT henkilo_id, passinumero, revtype FROM henkilo_passinumero_aud WHERE henkilo_id = ?",
            henkilo.getId());
    assertThat(passinumeroRow.get("passinumero")).isIn(henkilo.getPassinumerot());
    assertThat(revisionTypeOf(passinumeroRow)).isEqualTo(RevisionType.ADD);
  }

  private HenkiloHuoltajaSuhde createHenkiloHuoltajaSuhde(
      Henkilo huollettavaHenkilo, Henkilo huoltajaHenkilo) {
    var henkiloHuoltajaSuhde =
        HenkiloHuoltajaSuhde.builder()
            .lapsi(huollettavaHenkilo)
            .huoltaja(huoltajaHenkilo)
            .alkuPvm(LocalDate.now())
            .build();
    em.persist(henkiloHuoltajaSuhde);
    return henkiloHuoltajaSuhde;
  }

  private Henkilo createHenkilo(Organisaatio organisaatio, Kielisyys kielisyys) {
    var oid = "1.2.246.562.99." + new Random().nextInt(1000000000);
    var henkilo =
        Henkilo.builder()
            .oidHenkilo(oid)
            .etunimet(randomString())
            .kutsumanimi(randomString())
            .sukunimi(randomString())
            .aidinkieli(kielisyys)
            .kansalaisuus(Set.of(createKansalaisuus()))
            .organisaatiot(Set.of(organisaatio))
            .passinumerot(Set.of(randomString()))
            .created(new Date())
            .modified(new Date())
            .build();
    em.persist(henkilo);

    return henkilo;
  }

  private String randomString() {
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    return new Random()
        .ints(10, 0, characters.length())
        .mapToObj(i -> String.valueOf(characters.charAt(i)))
        .collect(Collectors.joining());
  }

  private Kielisyys createKielisyys() {
    var kielisyys = new Kielisyys(randomString());
    em.persist(kielisyys);

    return kielisyys;
  }

  private Organisaatio createOrganisaatio() {
    var oid = "1.2.246.562.10." + new Random().nextInt(1000000000);
    var organisaatio = Organisaatio.builder().oid(oid).build();
    em.persist(organisaatio);

    return organisaatio;
  }

  private Kansalaisuus createKansalaisuus() {
    var kansalaisuus = new Kansalaisuus();
    kansalaisuus.setKansalaisuusKoodi(randomString());
    em.persist(kansalaisuus);

    return kansalaisuus;
  }

  private PersistedEntities updateHuollettavaHenkiloAndHuoltajaHenkilo(
      PersistedEntities persistedEntities) {
    return new TransactionTemplate(transactionManager)
        .execute(
            status -> {
              var huollettavaHenkilo =
                  em.find(Henkilo.class, persistedEntities.huollettavaHenkilo().getId());
              var huoltajaHenkilo =
                  em.find(Henkilo.class, persistedEntities.huoltajaHenkilo().getId());
              var henkiloHuoltajaSuhde =
                  em.find(
                      HenkiloHuoltajaSuhde.class, persistedEntities.henkiloHuoltajaSuhde().getId());

              updateHenkilo(huollettavaHenkilo);
              updateHenkilo(huoltajaHenkilo);
              henkiloHuoltajaSuhde.setLoppuPvm(LocalDate.now().plusYears(1));

              return new PersistedEntities(
                  huollettavaHenkilo, huoltajaHenkilo, henkiloHuoltajaSuhde);
            });
  }

  private void updateHenkilo(Henkilo henkilo) {
    henkilo.setEtunimet(randomString());
    henkilo.setKutsumanimi(randomString());
    henkilo.setSukunimi(randomString());
    henkilo.setKansalaisuus(Set.of(createKansalaisuus()));
    henkilo.setOrganisaatiot(Set.of(createOrganisaatio()));
    henkilo.setPassinumerot(Set.of(randomString()));
  }

  private void assertThatHenkiloAuditTablesContainUpdateFor(long revision, Henkilo henkilo) {
    var henkiloRow =
        jdbcTemplate.queryForMap(
            "SELECT oidhenkilo, etunimet, kutsumanimi, sukunimi, revtype"
                + " FROM henkilo_aud WHERE id = ? AND rev = ?",
            henkilo.getId(),
            revision);
    assertThat(henkiloRow.get("oidhenkilo")).isEqualTo(henkilo.getOidHenkilo());
    assertThat(henkiloRow.get("etunimet")).isEqualTo(henkilo.getEtunimet());
    assertThat(henkiloRow.get("kutsumanimi")).isEqualTo(henkilo.getKutsumanimi());
    assertThat(henkiloRow.get("sukunimi")).isEqualTo(henkilo.getSukunimi());
    assertThat(revisionTypeOf(henkiloRow)).isEqualTo(RevisionType.MOD);

    assertCollectionReplacedAtRevision(
        "henkilo_kansalaisuus_aud",
        "kansalaisuus_id",
        henkilo.getId(),
        revision,
        henkilo.getKansalaisuus().stream().map(Kansalaisuus::getId).toList());
    assertCollectionReplacedAtRevision(
        "henkilo_organisaatio_aud",
        "organisaatio_id",
        henkilo.getId(),
        revision,
        henkilo.getOrganisaatiot().stream().map(Organisaatio::getId).toList());
    assertCollectionReplacedAtRevision(
        "henkilo_passinumero_aud",
        "passinumero",
        henkilo.getId(),
        revision,
        henkilo.getPassinumerot());
  }

  private void assertCollectionReplacedAtRevision(
      String table,
      String valueColumn,
      Long henkiloId,
      long revision,
      Collection<?> currentValues) {
    var rows =
        jdbcTemplate.queryForList(
            "SELECT "
                + valueColumn
                + ", revtype FROM "
                + table
                + " WHERE henkilo_id = ? AND rev = ?",
            henkiloId,
            revision);
    assertThat(rows)
        .extracting(this::revisionTypeOf)
        .containsExactlyInAnyOrder(RevisionType.ADD, RevisionType.DEL);

    var addedRow =
        rows.stream()
            .filter(row -> revisionTypeOf(row) == RevisionType.ADD)
            .findFirst()
            .orElseThrow();
    assertThat(addedRow.get(valueColumn)).isIn(currentValues);
  }

  private void assertThatHenkiloHuoltajaSuhdeAuditTableContainsUpdateFor(
      long revision, HenkiloHuoltajaSuhde henkiloHuoltajaSuhde) {
    var suhdeRow =
        jdbcTemplate.queryForMap(
            "SELECT id, lapsi_id, huoltaja_id, loppupvm, revtype"
                + " FROM henkilo_huoltaja_suhde_aud WHERE id = ? AND rev = ?",
            henkiloHuoltajaSuhde.getId(),
            revision);
    assertThat(suhdeRow.get("id")).isEqualTo(henkiloHuoltajaSuhde.getId());
    assertThat(suhdeRow.get("lapsi_id")).isEqualTo(henkiloHuoltajaSuhde.getLapsi().getId());
    assertThat(suhdeRow.get("huoltaja_id")).isEqualTo(henkiloHuoltajaSuhde.getHuoltaja().getId());
    assertThat(((java.sql.Date) suhdeRow.get("loppupvm")).toLocalDate())
        .isEqualTo(henkiloHuoltajaSuhde.getLoppuPvm());
    assertThat(revisionTypeOf(suhdeRow)).isEqualTo(RevisionType.MOD);
  }

  private long latestRevision() {
    return jdbcTemplate.queryForObject("SELECT MAX(rev) FROM revinfo", Long.class);
  }

  private RevisionType revisionTypeOf(java.util.Map<String, Object> row) {
    return RevisionType.fromRepresentation(((Number) row.get("revtype")).byteValue());
  }

  private void assertThatHenkiloAuditTablesContainRowsForRevision(long revision) {
    assertThat(countAuditRows("henkilo_aud", revision)).isPositive();
    assertThat(countAuditRows("henkilo_kansalaisuus_aud", revision)).isPositive();
    assertThat(countAuditRows("henkilo_organisaatio_aud", revision)).isPositive();
    assertThat(countAuditRows("henkilo_passinumero_aud", revision)).isPositive();
    assertThat(countAuditRows("henkilo_huoltaja_suhde_aud", revision)).isPositive();
    assertThat(countRevinfoRows(revision)).isEqualTo(1);
  }

  private void assertThatHenkiloAuditTablesAreEmptyForRevision(long revision) {
    assertThat(countAuditRows("henkilo_aud", revision)).isZero();
    assertThat(countAuditRows("henkilo_kansalaisuus_aud", revision)).isZero();
    assertThat(countAuditRows("henkilo_organisaatio_aud", revision)).isZero();
    assertThat(countAuditRows("henkilo_passinumero_aud", revision)).isZero();
    assertThat(countAuditRows("henkilo_huoltaja_suhde_aud", revision)).isZero();
    assertThat(countRevinfoRows(revision)).isZero();
  }

  private void ageRevision(long revision, Duration age) {
    var agedMillis = Instant.now().minus(age).toEpochMilli();
    jdbcTemplate.update("UPDATE revinfo SET revtstmp = ? WHERE rev = ?", agedMillis, revision);
  }

  private int countAuditRows(String table, long revision) {
    return jdbcTemplate.queryForObject(
        "SELECT count(*) FROM " + table + " WHERE rev = ?", Integer.class, revision);
  }

  private int countRevinfoRows(long revision) {
    return jdbcTemplate.queryForObject(
        "SELECT count(*) FROM revinfo WHERE rev = ?", Integer.class, revision);
  }

  private record PersistedEntities(
      Henkilo huollettavaHenkilo,
      Henkilo huoltajaHenkilo,
      HenkiloHuoltajaSuhde henkiloHuoltajaSuhde) {}
}
