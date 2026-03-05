package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
public class TiedotuspalveluApiTest {
  public static final String ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD =
      "ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD";

  @Autowired protected ObjectMapper objectMapper;
  @Autowired protected MockMvc mockMvc;
  @Autowired protected TiedoteRepository tiedoteRepository;

  protected SecurityMockMvcRequestPostProcessors.@NonNull JwtRequestPostProcessor validToken() {
    return jwt()
        .authorities(
            new SimpleGrantedAuthority(
                ROLE_APP_TIEDOTUSPALVELU_KIELITUTKINTOTODISTUS_TIEDOTE_CRUD));
  }

  protected Tiedote createTiedote(String oppijanumero) throws Exception {
    var content =
        objectMapper.writeValueAsString(
            new ApiController.TiedoteDto(oppijanumero, UUID.randomUUID().toString(), null));
    var response =
        mockMvc
            .perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                        "/api/v1/tiedote/kielitutkintotodistus")
                    .with(validToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var id = UUID.fromString(objectMapper.readTree(response).get("id").asText());
    return tiedoteRepository.findById(id).orElseThrow();
  }
}
