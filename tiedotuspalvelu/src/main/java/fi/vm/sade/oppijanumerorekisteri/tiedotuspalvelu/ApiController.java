package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ApiController {

  private final TiedoteRepository tiedoteRepository;

  public ApiController(TiedoteRepository tiedoteRepository) {
    this.tiedoteRepository = tiedoteRepository;
  }

  public record TiedoteDto(
      @NotBlank String oppijanumero,
      @NotBlank String titleFi,
      @NotBlank String titleSv,
      @NotBlank String titleEn,
      @NotBlank String messageFi,
      @NotBlank String messageSv,
      @NotBlank String messageEn,
      @NotBlank String idempotencyKey) {}

  public record CreateResponse(UUID id) {}

  @PostMapping("/tiedotteet")
  @PreAuthorize("hasRole('APP_TIEDOTUSPALVELU_CRUD')")
  public CreateResponse createTiedote(@RequestBody @Valid TiedoteDto tiedoteDto) {
    var existingTiedote = tiedoteRepository.findByIdempotencyKey(tiedoteDto.idempotencyKey());
    if (existingTiedote.isPresent()) {
      return new CreateResponse(existingTiedote.get().getId());
    }

    var tiedote =
        Tiedote.builder()
            .oppijanumero(tiedoteDto.oppijanumero())
            .titleFi(tiedoteDto.titleFi())
            .titleSv(tiedoteDto.titleSv())
            .titleEn(tiedoteDto.titleEn())
            .messageFi(tiedoteDto.messageFi())
            .messageSv(tiedoteDto.messageSv())
            .messageEn(tiedoteDto.messageEn())
            .idempotencyKey(tiedoteDto.idempotencyKey())
            .build();
    return new CreateResponse(tiedoteRepository.save(tiedote).getId());
  }
}
