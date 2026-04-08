package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;

public record StatusEntry(
    @Schema(example = CREATED) String status,
    @Schema(example = "2026-02-16T10:43:55.800603Z") OffsetDateTime timestamp) {
  public static final String CREATED = "CREATED";
  public static final String SENT_TO_SUOMIFI_VIESTIT = "SENT_TO_SUOMIFI_VIESTIT";
}
