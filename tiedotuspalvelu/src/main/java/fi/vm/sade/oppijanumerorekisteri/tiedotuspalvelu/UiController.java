package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.cas.CasUserDetailsService.ATTRIBUTE_KOKO_NIMI;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.cas.CasUserDetailsService;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ui/")
@RequiredArgsConstructor
public class UiController {
  private final TiedoteRepository tiedoteRepository;

  @Builder
  public record TiedoteDto(
      UUID id, String otsikko, String viesti, String url, OffsetDateTime createdAt) {}

  @GetMapping("/tiedotteet")
  @PreAuthorize("isAuthenticated()")
  List<TiedoteDto> getTiedotteetForCurrentUser() {
    var oppijanumero = currentUserOppijanumero();
    return oppijanumero
        .map(
            s ->
                tiedoteRepository.findByOppijanumeroOrderByIdAsc(s).stream()
                    .map(
                        t ->
                            TiedoteDto.builder()
                                .id(t.getId())
                                .otsikko(t.getTitleFi())
                                .viesti(t.getMessageFi())
                                .url("") // TODO
                                .createdAt(t.getCreated())
                                .build())
                    .toList())
        .orElseGet(List::of);
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
