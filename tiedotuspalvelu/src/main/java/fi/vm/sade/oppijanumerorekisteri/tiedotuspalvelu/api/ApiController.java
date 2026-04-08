package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.api;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedoteRepository;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViestitEventRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import java.util.ArrayList;
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
  private final SuomiFiViestitEventRepository suomiFiViestitEventRepository;
  private final EntityManager entityManager;

  public ApiController(
      TiedoteRepository tiedoteRepository,
      SuomiFiViestitEventRepository suomiFiViestitEventRepository,
      EntityManager entityManager) {
    this.tiedoteRepository = tiedoteRepository;
    this.suomiFiViestitEventRepository = suomiFiViestitEventRepository;
    this.entityManager = entityManager;
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
            .todistusBucketName(tiedoteDto.todistusBucketName())
            .todistusObjectKey(tiedoteDto.todistusObjectKey())
            .opiskeluoikeusOid(tiedoteDto.opiskeluoikeusOid().orElse(null))
            .type(Tiedote.TYPE_KIELITUTKINTOTODISTUS)
            .state(Tiedote.STATE_OPPIJAN_VALIDOINTI)
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
    var meta = new Meta(tiedote.getType(), tiedote.getState());
    var statuses = new ArrayList<StatusEntry>();
    statuses.add(new StatusEntry(StatusEntry.CREATED, tiedote.getCreated()));

    Optional.ofNullable(tiedote.getViesti())
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
