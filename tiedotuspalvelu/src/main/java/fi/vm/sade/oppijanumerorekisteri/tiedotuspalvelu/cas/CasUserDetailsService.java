package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.cas;

import java.io.Serial;
import java.util.*;

import org.springframework.security.cas.authentication.CasAssertionAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class CasUserDetailsService
    implements AuthenticationUserDetailsService<CasAssertionAuthenticationToken> {

  public static final String ATTRIBUTE_KOKO_NIMI = "displayName";
  public static final String ATTRIBUTE_KUTSUMANIMI = "givenName";
  public static final String ATTRIBUTE_SUKUNIMI = "sn";
  public static final String ATTRIBUTE_HETU = "nationalIdentificationNumber";
  public static final String ATTRIBUTE_OPPIJANUMERO = "personOid";

  private static final List<GrantedAuthority> DEFAULT_AUTHORITIES =
      List.of(new SimpleGrantedAuthority("ROLE_USER"));

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

    return new CasAuthenticatedUser(username, allAttributes);
  }

  public static final class CasAuthenticatedUser implements UserDetails {
    @Serial private static final long serialVersionUID = 1233976289493556161L;

    private final String username;
    private final Map<String, List<String>> attributes;

    private CasAuthenticatedUser(String username, Map<String, List<String>> attributes) {
      this.username = username;
      this.attributes = attributes;
    }

    public Optional<String> getHenkiloOid() {
      return attributes.getOrDefault(ATTRIBUTE_OPPIJANUMERO, List.of()).stream().findFirst();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
      return DEFAULT_AUTHORITIES;
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
