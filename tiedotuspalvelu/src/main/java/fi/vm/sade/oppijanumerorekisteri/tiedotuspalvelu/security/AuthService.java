package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  public boolean isVirkailija() {
    var authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication.getPrincipal()
        instanceof CasVirkailijaUserDetailsService.CasAuthenticatedUser;
  }

  public boolean isOppija() {
    var authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication.getPrincipal()
        instanceof CasOppijaUserDetailsService.CasAuthenticatedUser;
  }
}
