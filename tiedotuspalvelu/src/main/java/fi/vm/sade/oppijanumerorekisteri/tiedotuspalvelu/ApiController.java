package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViestiRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViestitEventRepository;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/omat-viestit/api/v1")
@Tag(name = "Tiedotteet")
public class ApiController {

  private final TiedoteRepository tiedoteRepository;
  private final SuomiFiViestiRepository suomiFiViestiRepository;
  private final SuomiFiViestitEventRepository suomiFiViestitEventRepository;
  private final EntityManager entityManager;

  public ApiController(
      TiedoteRepository tiedoteRepository,
      SuomiFiViestiRepository suomiFiViestiRepository,
      SuomiFiViestitEventRepository suomiFiViestitEventRepository,
      EntityManager entityManager) {
    this.tiedoteRepository = tiedoteRepository;
    this.suomiFiViestiRepository = suomiFiViestiRepository;
    this.suomiFiViestitEventRepository = suomiFiViestitEventRepository;
    this.entityManager = entityManager;
  }

  public record TiedoteDto(
      @Schema(example = "1.2.246.562.24.73833272757") @NotBlank String oppijanumero,
      @Schema(example = "a58d44fb-f970-430b-9b51-5e7bcc6a725b") @NotBlank String idempotencyKey,
      @Schema(example = "s3://esimerkkiampari/todistus.pdf") String todistusUrl,
      @Schema(example = "1.2.246.562.15.44316860822") Optional<String> opiskeluoikeusOid) {}

  public record TiedoteResponse(
      @Schema(example = "ecd8b9b1-4876-4cb8-8f29-0760eeb2ed8a") UUID id,
      @Schema(example = "1.2.246.562.24.73833272757") String oppijanumero,
      @Schema(example = "1.2.246.562.15.44316860822") Optional<String> opiskeluoikeusOid,
      Meta meta,
      List<StatusEntry> statuses) {}

  public record Meta(
      @Schema(example = TYPE_KIELITUTKINTOTODISTUS) String type,
      @Schema(example = STATE_NEW) String state) {
    public static final String TYPE_KIELITUTKINTOTODISTUS = "KIELITUTKINTOTODISTUS";
    public static final String STATE_NEW = "NEW";
    public static final String STATE_SUOMIFI_VIESTI_HETULLISELLE = "SUOMIFI_VIESTI_HETULLISELLE";
    public static final String STATE_PAPERIPOSTI_HETULLISELLE = "PAPERIPOSTI_HETULLISELLE";
    public static final String STATE_PAPERIPOSTI_HETUTTOMALLE = "PAPERIPOSTI_HETUTTOMALLE";
    public static final String STATE_PROCESSED = "PROCESSED";
  }

  public record StatusEntry(
      @Schema(example = CREATED) String status,
      @Schema(example = "2026-02-16T10:43:55.800603Z") OffsetDateTime timestamp) {
    public static final String CREATED = "CREATED";
    public static final String SENT_TO_SUOMIFI_VIESTIT = "SENT_TO_SUOMIFI_VIESTIT";
  }

  @PostMapping("/tiedote/kielitutkintotodistus")
  @PreAuthorize("hasRole('APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD')")
  @Transactional
  public TiedoteResponse createTiedote(@RequestBody @Valid TiedoteDto tiedoteDto) {
    var existingTiedote = tiedoteRepository.findByIdempotencyKey(tiedoteDto.idempotencyKey());
    if (existingTiedote.isPresent()) {
      return buildTiedoteResponse(existingTiedote.get());
    }

    var tiedote =
        Tiedote.builder()
            .oppijanumero(tiedoteDto.oppijanumero())
            .idempotencyKey(tiedoteDto.idempotencyKey())
            .todistusUrl(
                tiedoteDto.todistusUrl() != null ? tiedoteDto.todistusUrl() : "placeholder")
            .opiskeluoikeusOid(tiedoteDto.opiskeluoikeusOid().orElse(null))
            .tiedotetypeId(Meta.TYPE_KIELITUTKINTOTODISTUS)
            .tiedotestateId(Meta.STATE_NEW)
            .build();
    tiedoteRepository.saveAndFlush(tiedote);
    entityManager.refresh(tiedote);
    return buildTiedoteResponse(tiedote);
  }

  @GetMapping("/tiedote/{id}")
  @PreAuthorize("hasRole('APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD')")
  public ResponseEntity<TiedoteResponse> getTiedote(@PathVariable UUID id) {
    return tiedoteRepository
        .findById(id)
        .map(this::buildTiedoteResponse)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  private TiedoteResponse buildTiedoteResponse(Tiedote tiedote) {
    var meta = new Meta(tiedote.getTiedotetypeId(), tiedote.getTiedotestateId());
    var statuses = new ArrayList<StatusEntry>();
    statuses.add(new StatusEntry(StatusEntry.CREATED, tiedote.getCreated()));

    suomiFiViestiRepository
        .findByTiedoteId(tiedote.getId())
        .ifPresent(
            viesti -> {
              if (viesti.getProcessedAt() != null) {
                statuses.add(
                    new StatusEntry(StatusEntry.SENT_TO_SUOMIFI_VIESTIT, viesti.getProcessedAt()));
              }
              if (viesti.getMessageId() != null) {
                suomiFiViestitEventRepository
                    .findByMessageIdOrderByEventTimeAsc(viesti.getMessageId())
                    .forEach(
                        event ->
                            statuses.add(
                                new StatusEntry(event.getEventType(), event.getEventTime())));
              }
            });

    return new TiedoteResponse(
        tiedote.getId(),
        tiedote.getOppijanumero(),
        Optional.ofNullable(tiedote.getOpiskeluoikeusOid()),
        meta,
        statuses);
  }
}
