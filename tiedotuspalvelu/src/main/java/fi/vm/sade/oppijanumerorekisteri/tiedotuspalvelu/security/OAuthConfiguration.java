package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.security;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.TiedotuspalveluProperties;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

@Configuration
@RequiredArgsConstructor
public class OAuthConfiguration {
  private final TiedotuspalveluProperties properties;

  @Bean
  Converter<Jwt, AbstractAuthenticationToken> oauth2JwtConverter() {
    return new Converter<>() {
      final JwtGrantedAuthoritiesConverter delegate = new JwtGrantedAuthoritiesConverter();

      @Override
      public AbstractAuthenticationToken convert(Jwt source) {
        var authorityList = extractRoles(source);
        var delegateAuthorities = delegate.convert(source);
        authorityList.addAll(delegateAuthorities);
        return new JwtAuthenticationToken(source, authorityList);
      }

      private List<GrantedAuthority> extractRoles(Jwt jwt) {
        Map<String, List<String>> roleClaim =
            jwt.getClaims().get("roles") != null
                ? (Map<String, List<String>>) jwt.getClaims().get("roles")
                : Map.of();
        var roles =
            roleClaim.keySet().stream()
                .map(
                    (oid) -> {
                      var orgRoles = roleClaim.get(oid);
                      return orgRoles.stream()
                          .map(
                              (role) -> List.of("ROLE_APP_" + role, "ROLE_APP_" + role + "_" + oid))
                          .toList();
                    })
                .flatMap(List::stream)
                .flatMap(List::stream)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.<GrantedAuthority>toList());
        return roles;
      }
    };
  }
}
