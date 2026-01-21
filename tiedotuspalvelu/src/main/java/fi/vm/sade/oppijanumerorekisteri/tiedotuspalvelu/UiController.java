package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.cas.CasUserDetailsService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
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

  public record TiedoteDto(UUID id, String url) {}

  @GetMapping("/tiedotteet")
  @PreAuthorize("isAuthenticated()")
  List<TiedoteDto> getTiedotteetForCurrentUser() {
    var oppijanumero = currentUserOppijanumero();
    return oppijanumero
        .map(
            s ->
                tiedoteRepository.findByOppijanumeroOrderByIdAsc(s).stream()
                    .map(t -> new TiedoteDto(t.getId(), t.getUrl()))
                    .toList())
        .orElseGet(List::of);
  }

  @GetMapping("/me")
  @PreAuthorize("isAuthenticated()")
  public MeResponse me() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    var principal = (CasUserDetailsService.CasAuthenticatedUser) auth.getPrincipal();
    var authorities = principal.getAttributes();
    return new MeResponse(authorities.get("firstName").get(0));
  }

  public record MeResponse(String etunimi) {}

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
