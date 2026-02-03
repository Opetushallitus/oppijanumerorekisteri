package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
public class ApiControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private TiedoteRepository tiedoteRepository;

  @MockitoBean private JwtDecoder jwtDecoder;

  @Test
  public void createTiedoteRequiresAuthentication() throws Exception {
    mockMvc
        .perform(post("/api/v1/tiedotteet").contentType(MediaType.APPLICATION_JSON).content("{}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  public void createTiedoteFailsWithoutRequiredRole() throws Exception {
    Map<String, String> data = new HashMap<>();
    data.put("oppijanumero", "1.2.246.562.99.12345678901");
    data.put("url", "https://example.com");
    data.put("titleFi", "Otsikko");
    data.put("titleSv", "Rubrik");
    data.put("titleEn", "Title");
    data.put("messageFi", "Viesti");
    data.put("messageSv", "Meddelande");
    data.put("messageEn", "Message");

    mockMvc
        .perform(
            post("/api/v1/tiedotteet")
                .with(jwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(data)))
        .andExpect(status().isForbidden());
  }

  @Test
  public void createTiedoteSucceedsWithValidData() throws Exception {
    tiedoteRepository.deleteAll();
    Map<String, String> data = new HashMap<>();
    data.put("oppijanumero", "1.2.246.562.99.12345678901");
    data.put("url", "https://example.com");
    data.put("titleFi", "Otsikko");
    data.put("titleSv", "Rubrik");
    data.put("titleEn", "Title");
    data.put("messageFi", "Viesti");
    data.put("messageSv", "Meddelande");
    data.put("messageEn", "Message");

    mockMvc
        .perform(
            post("/api/v1/tiedotteet")
                .with(
                    jwt().authorities(new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(data)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").exists());

    String responseBody =
        mockMvc
            .perform(
                post("/api/v1/tiedotteet")
                    .with(
                        jwt()
                            .authorities(
                                new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(data)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    UUID returnedId = UUID.fromString(objectMapper.readTree(responseBody).get("id").asText());

    List<Tiedote> tiedotteet = tiedoteRepository.findAll();
    assertEquals(2, tiedotteet.size());
    Tiedote saved = tiedotteet.stream().filter(t -> t.getId().equals(returnedId)).findFirst().get();
    assertEquals(saved.getId(), returnedId);
    assertEquals("1.2.246.562.99.12345678901", saved.getOppijanumero());
    assertEquals("https://example.com", saved.getUrl());
    assertEquals("Otsikko", saved.getTitleFi());
    assertEquals("Rubrik", saved.getTitleSv());
    assertEquals("Title", saved.getTitleEn());
    assertEquals("Viesti", saved.getMessageFi());
    assertEquals("Meddelande", saved.getMessageSv());
    assertEquals("Message", saved.getMessageEn());
  }

  @Test
  public void createTiedoteFailsWhenFieldsAreMissing() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/tiedotteet")
                .with(
                    jwt().authorities(new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("oppijanumero", "1.2.246.562.99.12345678901"))))
        .andExpect(status().isBadRequest());

    mockMvc
        .perform(
            post("/api/v1/tiedotteet")
                .with(
                    jwt().authorities(new SimpleGrantedAuthority("ROLE_APP_TIEDOTUSPALVELU_CRUD")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("url", "https://example.com"))))
        .andExpect(status().isBadRequest());
  }
}
