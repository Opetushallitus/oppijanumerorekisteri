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

  public record TiedoteDto(@NotBlank String oppijanumero, @NotBlank String url) {}

  public record CreateResponse(UUID id) {}

  @PostMapping("/tiedotteet")
  @PreAuthorize("hasRole('APP_TIEDOTUSPALVELU_CRUD')")
  public CreateResponse createTiedote(@RequestBody @Valid TiedoteDto tiedoteDto) {
    var tiedote =
        Tiedote.builder().oppijanumero(tiedoteDto.oppijanumero()).url(tiedoteDto.url()).build();
    return new CreateResponse(tiedoteRepository.save(tiedote).getId());
  }
}
