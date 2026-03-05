package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViestiRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViestitEventRepository;
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
@RequestMapping("/api/v1")
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
      @NotBlank String oppijanumero,
      @NotBlank String idempotencyKey,
      String todistusUrl,
      Optional<String> opiskeluoikeusOid) {}

  public record TiedoteResponse(
      UUID id, Optional<String> opiskeluoikeusOid, Meta meta, List<StatusEntry> statuses) {}

  public record Meta(String type, String state) {
    public static final String TYPE_KIELITUTKINTOTODISTUS = "KIELITUTKINTOTODISTUS";
    public static final String STATE_NEW = "NEW";
    public static final String STATE_SUOMIFI_VIESTI_HETULLISELLE = "SUOMIFI_VIESTI_HETULLISELLE";
    public static final String STATE_PROCESSED = "PROCESSED";
  }

  public record StatusEntry(String status, OffsetDateTime timestamp) {
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
        tiedote.getId(), Optional.ofNullable(tiedote.getOpiskeluoikeusOid()), meta, statuses);
  }
}
