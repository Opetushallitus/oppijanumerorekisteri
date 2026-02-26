package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.cas.CasUserDetailsService.ATTRIBUTE_KOKO_NIMI;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.cas.CasUserDetailsService;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale.LocalisationRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ui/")
@RequiredArgsConstructor
@Slf4j
public class UiController {
  private final TiedoteRepository tiedoteRepository;
  private final LocalisationRepository localisationRepository;

  @Builder
  public record TiedoteDto(UUID id, OffsetDateTime createdAt) {}

  @GetMapping("/tiedotteet")
  @PreAuthorize("isAuthenticated()")
  List<TiedoteDto> getTiedotteetForCurrentUser() {
    var oppijanumero = currentUserOppijanumero();
    log.info("Fetching tiedotteet for oppijanumero: {}", oppijanumero.orElse("<none>"));
    return oppijanumero
        .map(
            s ->
                tiedoteRepository.findByOppijanumeroOrderByIdAsc(s).stream()
                    .map(t -> TiedoteDto.builder().id(t.getId()).createdAt(t.getCreated()).build())
                    .toList())
        .orElseGet(List::of);
  }

  @GetMapping("/localisations")
  List<LocalisationRepository.LocalisationDto> getLocalisations() {
    return localisationRepository.findAllWithFallback();
  }

  @GetMapping("/me")
  @PreAuthorize("isAuthenticated()")
  public MeResponse me() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    var principal = (CasUserDetailsService.CasAuthenticatedUser) auth.getPrincipal();
    var attributes = principal.getAttributes();
    return new MeResponse(attributes.get(ATTRIBUTE_KOKO_NIMI).get(0));
  }

  public record MeResponse(String nimi) {}

  private static Optional<String> currentUserOppijanumero() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || auth.getPrincipal() == null) {
      return Optional.empty();
    }

    if (auth.getPrincipal() instanceof CasUserDetailsService.CasAuthenticatedUser principal) {
      Map<String, List<String>> attributes = principal.getAttributes();
      return attributes.getOrDefault("personOid", List.of()).stream().findFirst();
    }

    return Optional.empty();
  }
}
