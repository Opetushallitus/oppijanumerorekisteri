package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.cas.CasUserDetailsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
    public CasUserDetailsService.CasAuthenticatedUser me() throws JsonProcessingException {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return (CasUserDetailsService.CasAuthenticatedUser) auth.getPrincipal();
    }
}
