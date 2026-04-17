package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security.CasVirkailijaUserDetailsService;
import io.swagger.v3.oas.annotations.Hidden;
import java.io.ByteArrayOutputStream;
import lombok.RequiredArgsConstructor;
import org.postgresql.PGConnection;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tiedotuspalvelu/ui/")
@RequiredArgsConstructor
@Hidden
public class VirkailijaUiController {
  private final JdbcTemplate jdbcTemplate;

  @GetMapping("/me")
  @PreAuthorize("hasRole('APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD')")
  public MeResponse me() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    var principal = (CasVirkailijaUserDetailsService.CasAuthenticatedUser) auth.getPrincipal();
    return new MeResponse(principal.getUsername());
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
                          SELECT
                              t.id as "Tiedotteen ID",
                              (t.created at time zone 'Europe/Helsinki') as "Tiedotteen luontiaika",
                              t.tiedotetype_id as "Tiedotteen tyyppi",
                              t.oppijanumero as "Tiedotteen vastaanottajan oppijanumero",
                              t.opiskeluoikeus_oid as "Tiedotteeseen littyvän opiskeluoikeuden OID",
                              t.tiedotestate_id as "Tiedotteen käsittelyn tila tiedotuspalvelussa",
                              t.todistus_url as "Kielitutkintotodistuksen URL",

                              v.message_id as "Viestin ID",
                              v.message_type as "Viestin tyyppi",
                              v.name as "Vastaanottaja",
                              concat(v.street_address, ' ', v.zip_code, ' ', v.city, ' ', v.country_code)
                                  as "Vastaanottajan osoite",
                              coalesce((v.processed_at at time zone 'Europe/Helsinki')::text, concat('Ei välitetty; yritetty ', coalesce(v.retry_count, 0), ' kertaa'))
                                  as "Viesti välitetty Suomi.fi-viestit palveluun",
                              v.otsikko as "Viestin otsikko",
                              v.sisalto as "Viestin sisältö"
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

  public record MeResponse(String nimi) {}
}
