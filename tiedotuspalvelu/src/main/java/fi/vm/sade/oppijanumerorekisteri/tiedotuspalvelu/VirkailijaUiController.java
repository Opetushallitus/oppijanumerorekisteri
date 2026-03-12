package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security.CasVirkailijaUserDetailsService;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViestiRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViestitEventRepository;
import io.swagger.v3.oas.annotations.Hidden;
import java.io.ByteArrayOutputStream;
import java.time.OffsetDateTime;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.postgresql.PGConnection;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tiedotuspalvelu/ui/")
@RequiredArgsConstructor
@Hidden
public class VirkailijaUiController {
  private final JdbcTemplate jdbcTemplate;
  private final TiedoteRepository tiedoteRepository;
  private final SuomiFiViestiRepository suomiFiViestiRepository;
  private final SuomiFiViestitEventRepository suomiFiViestitEventRepository;

  @GetMapping("/me")
  @PreAuthorize("hasRole('APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD')")
  public MeResponse me() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    var principal = (CasVirkailijaUserDetailsService.CasAuthenticatedUser) auth.getPrincipal();
    return new MeResponse(principal.getUsername());
  }

  @GetMapping("/tiedotteet")
  @PreAuthorize("hasRole('APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD')")
  public List<TiedoteRow> tiedotteet() {
    return jdbcTemplate.query(
        """
        SELECT id, oppijanumero, tiedotetype_id, tiedotestate_id, created
        FROM tiedote
        ORDER BY created DESC
        LIMIT 1000
        """,
        (rs, rowNum) ->
            new TiedoteRow(
                rs.getObject("id", UUID.class).toString(),
                rs.getString("oppijanumero"),
                rs.getString("tiedotetype_id"),
                rs.getString("tiedotestate_id"),
                rs.getObject("created", OffsetDateTime.class).toString()));
  }

  @GetMapping("/tiedotteet/csv")
  @PreAuthorize("hasRole('APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD')")
  public ResponseEntity<byte[]> tiedotteetCsv() {
    var csvBytes =
        jdbcTemplate.execute(
            (java.sql.Connection conn) -> {
              try {
                var pgConn = conn.unwrap(PGConnection.class);
                var out = new ByteArrayOutputStream();
                pgConn
                    .getCopyAPI()
                    .copyOut(
                        """
                        COPY (
                          SELECT t.id, t.oppijanumero, t.tiedotetype_id, t.tiedotestate_id,
                                 t.opiskeluoikeus_oid, t.todistus_url, t.created,
                                 v.message_type, v.name, v.street_address, v.zip_code,
                                 v.city, v.country_code, v.message_id, v.processed_at
                          FROM tiedote t
                          LEFT JOIN suomifi_viesti v ON v.tiedote_id = t.id
                          ORDER BY t.created DESC
                        ) TO STDOUT WITH (FORMAT CSV, HEADER, DELIMITER ';', NULL '')
                        """,
                        out);
                return out.toByteArray();
              } catch (java.io.IOException e) {
                throw new java.io.UncheckedIOException(e);
              }
            });

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tiedotteet.csv\"")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(csvBytes);
  }

  @GetMapping("/tiedotteet/{id}")
  @PreAuthorize("hasRole('APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD')")
  public ResponseEntity<TiedoteDetail> tiedote(@PathVariable UUID id) {
    return tiedoteRepository
        .findById(id)
        .map(this::buildTiedoteDetail)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  private TiedoteDetail buildTiedoteDetail(Tiedote tiedote) {
    var statuses = new ArrayList<StatusEntry>();
    statuses.add(new StatusEntry("CREATED", tiedote.getCreated().toString()));

    suomiFiViestiRepository
        .findByTiedoteId(tiedote.getId())
        .ifPresent(
            viesti -> {
              if (viesti.getProcessedAt() != null) {
                statuses.add(
                    new StatusEntry("SENT_TO_SUOMIFI_VIESTIT", viesti.getProcessedAt().toString()));
              }
              if (viesti.getMessageId() != null) {
                suomiFiViestitEventRepository
                    .findByMessageIdOrderByEventTimeAsc(viesti.getMessageId())
                    .forEach(
                        event ->
                            statuses.add(
                                new StatusEntry(
                                    event.getEventType(), event.getEventTime().toString())));
              }
            });

    return new TiedoteDetail(
        tiedote.getId().toString(),
        tiedote.getOppijanumero(),
        tiedote.getTiedotetypeId(),
        tiedote.getTiedotestateId(),
        tiedote.getOpiskeluoikeusOid(),
        tiedote.getCreated().toString(),
        statuses);
  }

  public record MeResponse(String nimi) {}

  public record TiedoteRow(
      String id,
      String oppijanumero,
      String tiedotetype_id,
      String tiedotestate_id,
      String created) {}

  public record TiedoteDetail(
      String id,
      String oppijanumero,
      String tiedotetypeId,
      String tiedotestateId,
      String opiskeluoikeusOid,
      String created,
      List<StatusEntry> statuses) {}

  public record StatusEntry(String status, String timestamp) {}
}
