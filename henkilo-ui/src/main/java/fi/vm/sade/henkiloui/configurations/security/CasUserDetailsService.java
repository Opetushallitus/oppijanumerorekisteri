package fi.vm.sade.henkiloui.configurations.security;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.cas.authentication.CasAssertionAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.*;

import java.util.Collection;

import static java.util.Collections.emptyList;

public class CasUserDetailsService implements AuthenticationUserDetailsService<CasAssertionAuthenticationToken> {
    private static final String SUOMI_FI_IDP_ENTITY_ID = "vetuma";

    @Override
    public UserDetails loadUserDetails(CasAssertionAuthenticationToken token) throws UsernameNotFoundException {
        var casKayttajatunnus = token.getName();
        var attributes = token.getAssertion().getPrincipal().getAttributes();
        boolean strongAuth = SUOMI_FI_IDP_ENTITY_ID.equals(attributes.get("idpEntityId"));
        var kayttajaTyyppi = (String) attributes.get("kayttajaTyyppi");
        var henkiloOid = (String) attributes.get("oidHenkilo");
        return new CasUserDetails(casKayttajatunnus, henkiloOid, casKayttajatunnus, strongAuth, kayttajaTyyppi);
    }

    @RequiredArgsConstructor(access = AccessLevel.PRIVATE)
    @Getter
    public static class CasUserDetails implements UserDetails {
        private static final long serialVersionUID = 5084352322822608953L;

        private final String username;
        private final String henkiloOid;
        private final String casUsername;
        private final boolean strongAuth;
        private final String kayttajaTyyppi;

        public boolean isPalvelukayttaja() {
            return "PALVELU".equals(kayttajaTyyppi);
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return emptyList();
        }

        @Override
        public String getPassword() {
            return null;
        }

        @Override
        public String getUsername() {
            return getHenkiloOid();
        }

        public String getCasKayttajatunnus() {
            return casUsername != null ? casUsername : username;
        }

        public String getHenkiloOid() {
            return henkiloOid != null ? henkiloOid : username;
        }

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
            return true;
        }
    }
}
