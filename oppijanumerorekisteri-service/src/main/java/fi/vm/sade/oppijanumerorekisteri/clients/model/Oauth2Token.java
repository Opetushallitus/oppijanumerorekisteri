package fi.vm.sade.oppijanumerorekisteri.clients.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Oauth2Token {
    String access_token;
    String token_type;
    Integer expires_in;
}
