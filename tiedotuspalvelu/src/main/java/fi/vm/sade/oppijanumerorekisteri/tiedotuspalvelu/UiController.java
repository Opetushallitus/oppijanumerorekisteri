package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.cas.CasUserDetailsService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ui/")
public class UiController {
  public record Tiedote() {}

  @GetMapping("/tiedotteet")
  @PreAuthorize("isAuthenticated()")
  List<Tiedote> getTiedotteetForCurrentUser() {
    return List.of();
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
}
