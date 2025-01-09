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
        var username = token.getName();
        var attributes = token.getAssertion().getPrincipal().getAttributes();
        boolean strongAuth = SUOMI_FI_IDP_ENTITY_ID.equals(attributes.get("idpEntityId"));
        var kayttajaTyyppi = (String) attributes.get("kayttajaTyyppi");
        return new CasUserDetails(username, strongAuth, kayttajaTyyppi);
    }

    @RequiredArgsConstructor(access = AccessLevel.PRIVATE)
    @Getter
    public static class CasUserDetails implements UserDetails {
        private final String username;
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
            return username;
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
