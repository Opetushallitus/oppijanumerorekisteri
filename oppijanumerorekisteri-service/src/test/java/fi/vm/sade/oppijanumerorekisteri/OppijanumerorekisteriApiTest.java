package fi.vm.sade.oppijanumerorekisteri;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.impl.AwsSnsHenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import jakarta.persistence.EntityManager;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public abstract class OppijanumerorekisteriApiTest {
    @Autowired
    protected EntityManager entityManager;
    @Autowired
    protected MockMvc mvc;
    @Autowired
    protected ObjectMapper objectMapper;
    @MockitoBean
    protected AwsSnsHenkiloModifiedTopic henkiloModifiedTopic;
    @MockitoBean
    protected KayttooikeusClient kayttooikeusClient;
    @Autowired
    protected HenkiloViiteRepository henkiloViiteRepository;


    protected void assertLinked(String masterOid, String slaveOid) {
        List<HenkiloViite> viitteet = henkiloViiteRepository.findByMasterOid(masterOid).stream().filter(viite -> viite.getSlaveOid().equals(slaveOid)).collect(Collectors.toList());
        assertEquals(1, viitteet.size(), "Expected henkilös " + masterOid + " and " + slaveOid + " to be linked");
    }

    protected <T> T getJson(Class<T> responseClass, String endpoint, Object... args) throws Exception {
        var result = mvc.perform(get(String.format(endpoint, args))).andExpect(status().is(200)).andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), responseClass);
    }

    protected <T> List<T> getJsonArray(Class<T> responseClass, String endpoint, Object... args) throws Exception {
        var arrayType = TypeFactory.defaultInstance().constructCollectionType(List.class, responseClass);
        var result = mvc.perform(get(String.format(endpoint, args))).andExpect(status().is(200)).andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), arrayType);
    }

    protected <RequestT> MockHttpServletRequestBuilder createRequest(MockHttpServletRequestBuilder builder, RequestT requestBody) throws JsonProcessingException {
        return builder
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody));
    }

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @WithMockUser(roles = {
            "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA",
            "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001"
    })
    public @interface UserRekisterinpitaja {
    }

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @WithMockUser(roles = {
            "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI",
            "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI_1.2.246.562.10.00000000001"
    })
    protected @interface UserOppijoidenTuoja {
    }
}
