package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security;

import java.io.Serial;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Builder;
import org.springframework.security.cas.authentication.CasAssertionAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class CasVirkailijaUserDetailsService
    implements AuthenticationUserDetailsService<CasAssertionAuthenticationToken> {

  public static final String ATTRIBUTE_DISPLAY_NAME = "displayName";
  public static final String ATTRIBUTE_OID_HENKILO = "oidHenkilo";

  private static final GrantedAuthority ROLE_USER = new SimpleGrantedAuthority("ROLE_USER");

  @Override
  public UserDetails loadUserDetails(CasAssertionAuthenticationToken token)
      throws UsernameNotFoundException {
    var username = token.getAssertion().getPrincipal().getName();
    var allAttributes = new HashMap<String, List<String>>();
    token
        .getAssertion()
        .getPrincipal()
        .getAttributes()
        .forEach(
            (key, value) -> {
              if (value instanceof List<?> list) {
                allAttributes.put(key, list.stream().map(Object::toString).toList());
              } else {
                allAttributes.put(key, List.of(value.toString()));
              }
            });

    var roleStrings = allAttributes.getOrDefault("roles", List.of());
    List<GrantedAuthority> roleAuthorities =
        roleStrings.stream()
            .map(role -> (GrantedAuthority) new SimpleGrantedAuthority(role))
            .collect(Collectors.toList());

    return new CasAuthenticatedUser(username, allAttributes, roleAuthorities);
  }

  @Builder
  public static final class CasAuthenticatedUser implements UserDetails {
    @Serial private static final long serialVersionUID = 1L;

    private final String username;
    private final Map<String, List<String>> attributes;
    private final List<GrantedAuthority> authorities;

    private CasAuthenticatedUser(
        String username,
        Map<String, List<String>> attributes,
        List<GrantedAuthority> roleAuthorities) {
      this.username = username;
      this.attributes = attributes;
      this.authorities =
          Stream.concat(Stream.of(ROLE_USER), roleAuthorities.stream()).distinct().toList();
    }

    public Optional<String> getDisplayName() {
      return attributes.getOrDefault(ATTRIBUTE_DISPLAY_NAME, List.of()).stream().findFirst();
    }

    public Optional<String> getOidHenkilo() {
      return attributes.getOrDefault(ATTRIBUTE_OID_HENKILO, List.of()).stream().findFirst();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
      return authorities;
    }

    @Override
    public String getPassword() {
      return "";
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

    public Map<String, List<String>> getAttributes() {
      if (attributes == null) {
        return Map.of();
      }
      return attributes;
    }
  }
}
