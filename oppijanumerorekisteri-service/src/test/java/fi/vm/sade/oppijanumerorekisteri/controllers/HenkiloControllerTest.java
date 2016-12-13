package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.validation.BindException;

import javax.validation.ConstraintViolationException;
import javax.validation.ValidationException;

import java.util.Arrays;
import java.util.Collections;

import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhmaKuvaus.KOTIOSOITE;
import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhmaKuvaus.TYOOSOITE;
import static java.util.Optional.empty;
import static java.util.Optional.of;
import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(HenkiloController.class)
public class HenkiloControllerTest {
    @Autowired
    private MockMvc mvc;

    @MockBean
    private HenkiloService henkiloService;

    @MockBean
    private PermissionChecker permissionChecker;

    @MockBean
    private HenkiloUpdatePostValidator henkiloUpdatePostValidator;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "1.2.3.4.5")
    public void hasHetu() throws Exception {
        given(this.henkiloService.getHasHetu()).willReturn(true);
        this.mvc.perform(get("/henkilo/current/hasHetu").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().string("true"));
    }

    @Test
    @WithMockUser
    public void henkiloOidHetuNimiByHetu() throws Exception {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = DtoUtils.createHenkiloOidHetuNimiDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5");
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"123456-9999\"," +
                "\"oidHenkilo\": \"1.2.3.4.5\"}";
        given(this.henkiloService.getHenkiloOidHetuNimiByHetu("123456-9999")).willReturn(henkiloOidHetuNimiDto);
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/123456-9999").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(content));
    }

    @Test
    @WithMockUser
    public void henkiloOidHetuNimiByHetuNotFound() throws Exception {
        given(this.henkiloService.getHenkiloOidHetuNimiByHetu("123456-9999")).willThrow(new NotFoundException());
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/123456-9999").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void findHenkilotByOidList() throws Exception {
        HenkiloPerustietoDto henkiloPerustietoDto = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", "fi", "suomi", "246", "1.2.3.4.1");
        String inputOidList = "[\"1.2.3.4.5\"]";
        String returnContent = "[" +
                "  {" +
                "    \"aidinkieli\": {" +
                "      \"kieliKoodi\": \"fi\"," +
                "      \"kieliTyyppi\": \"suomi\"" +
                "    }," +
                "    \"asiointikieli\": {" +
                "      \"kieliKoodi\": \"fi\"," +
                "      \"kieliTyyppi\": \"suomi\"" +
                "    }," +
                "    \"etunimet\": \"arpa\"," +
                "    \"hetu\": \"123456-9999\"," +
                "    \"kutsumanimi\": \"arpa\"," +
                "    \"oidHenkilo\": \"1.2.3.4.5\"," +
                "    \"sukunimi\": \"kuutio\"" +
                "  }" +
                "]";
        given(this.henkiloService.getHenkiloPerustietoByOids(Collections.singletonList("1.2.3.4.5")))
                .willReturn(Collections.singletonList(henkiloPerustietoDto));
        this.mvc.perform(post("/henkilo/henkiloPerustietosByHenkiloOidList").content(inputOidList)
                .contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(returnContent));
    }

    @Test
    @WithMockUser
    public void createNewHenkilo() throws Exception {
        this.objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        HenkiloPerustietoDto henkiloPerustietoDto = HenkiloPerustietoDto.builder().etunimet("arpa").kutsumanimi("arpa").sukunimi("kuutio")
        .hetu("123456-9999").oidHenkilo("1.2.3.4.5").henkiloTyyppi(HenkiloTyyppi.VIRKAILIJA).build();
        String inputContent = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"081296-967T\"," +
                "\"henkiloTyyppi\": \"VIRKAILIJA\"}";
        given(this.henkiloService.createHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willReturn(henkiloPerustietoDto);
        this.mvc.perform(post("/henkilo/createHenkilo").content(inputContent).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isCreated()).andExpect(content().json(this.objectMapper.writeValueAsString(henkiloPerustietoDto)));
    }

    @Test
    @WithMockUser
    public void createHenkiloConstraintViolationException() throws Exception {
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"123456-9999\"}";
        given(this.henkiloService.createHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willThrow(new ConstraintViolationException("message", null));
        this.mvc.perform(post("/henkilo/createHenkilo").content(content).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void createHenkiloDataIntegrityViolationException() throws Exception {
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"123456-9999\"}";
        given(this.henkiloService.createHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willThrow(new DataIntegrityViolationException("message"));
        this.mvc.perform(post("/henkilo/createHenkilo").content(content).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void createHenkiloNullHetuTest() throws Exception {
        HenkiloPerustietoDto henkiloPerustietoDto = HenkiloPerustietoDto.builder().etunimet("arpa").kutsumanimi("arpa").sukunimi("kuutio")
                .oidHenkilo("1.2.3.4.5").build();
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"oidHenkilo\": \"1.2.3.4.5\"}";
        given(this.henkiloService.createHenkiloFromPerustietoDto(any(HenkiloPerustietoDto.class))).willReturn(henkiloPerustietoDto);
        this.mvc.perform(post("/henkilo/createHenkilo").content(content).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5")
    public void getHenkiloYhteystiedot() throws Exception {
        String content = "{" +
                "  \"kotiosoite\": {" +
                "    \"sahkoposti\": \"testi@test.com\"," +
                "  }" +
                "}";
        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.5")).willReturn(new HenkilonYhteystiedotViewDto()
            .put(YhteystietoRyhmaKuvaus.KOTIOSOITE, YhteystiedotDto.builder().sahkoposti("testi@test.com").build()));
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json(content));
        
        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.6")).willReturn(new HenkilonYhteystiedotViewDto());
        this.mvc.perform(get("/henkilo/1.2.3.4.6/yhteystiedot").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json("{}"));
    }
    
    @Test
    @WithMockUser(username = "1.2.3.4.5")
    public void getAllHenkiloYhteystiedot() throws Exception {
        String content = "{" +
                "  \"sahkoposti\": \"testi@test.com\"" +
                "}";
        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.5", KOTIOSOITE)).willReturn(
                of(YhteystiedotDto.builder().sahkoposti("testi@test.com").build()));
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/kotiosoite").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json(content));
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/yhteystietotyyppi1").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json(content));

        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.5", TYOOSOITE)).willReturn(empty());
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/tyoosoite").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());

        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.6", KOTIOSOITE)).willReturn(empty());
        this.mvc.perform(get("/henkilo/1.2.3.4.6/yhteystiedot/kotiosoite").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());

        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/tuntematon_tyyppi").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"INAPPROPRIATE_ROLE"})
    public void unauthorizedTest() throws Exception {
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/123456-9999").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    public void henkiloOidHetuNimisByName() throws Exception {
        String returnContent = "[{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"123456-9999\"," +
                "\"oidHenkilo\": \"1.2.3.4.5\"}]";
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = DtoUtils.createHenkiloOidHetuNimiDto("arpa", "arpa","kuutio",
                "123456-9999", "1.2.3.4.5");
        given(this.henkiloService.getHenkiloOidHetuNimiByName("arpa", "kuutio")).willReturn(Collections.singletonList(henkiloOidHetuNimiDto));
        this.mvc.perform(get("/henkilo/henkiloPerusByName").param("etunimet", "arpa").param("sukunimi", "kuutio")
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(returnContent));

    }

    @Test
    @WithMockUser
    public void updateHenkilo() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = DtoUtils.createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246", "1.2.3.4.1",
                "arpa@kuutio.fi");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloService.updateHenkiloFromHenkiloUpdateDto(any(HenkiloUpdateDto.class))).willReturn(henkiloUpdateDto);
        this.mvc.perform(put("/henkilo/updateHenkilo").content(inputContent).contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8)).andExpect(status().isOk()).andExpect(content().string("1.2.3.4.5"));
    }

    @Test
    @WithMockUser
    public void updateHenkiloBindingException() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = DtoUtils.createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", "1.2.3.4.1",
                "arpa@kuutio.fi");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloService.updateHenkiloFromHenkiloUpdateDto(any(HenkiloUpdateDto.class))).willThrow(new BindException(henkiloUpdateDto, "henkiloUpdateDTo"));
        this.mvc.perform(put("/henkilo/updateHenkilo").content(inputContent).contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8)).andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void updateHenkiloNotFoundException() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = DtoUtils.createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246", "1.2.3.4.1",
                "arpa@kuutio.fi");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloService.updateHenkiloFromHenkiloUpdateDto(any(HenkiloUpdateDto.class))).willThrow(new NotFoundException());
        this.mvc.perform(put("/henkilo/updateHenkilo").content(inputContent).contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8)).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void updateHenkiloValidationException() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = DtoUtils.createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", "1.2.3.4.1",
                "arpa@kuutio.fi");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloService.updateHenkiloFromHenkiloUpdateDto(any(HenkiloUpdateDto.class))).willThrow(new ValidationException());
        this.mvc.perform(put("/henkilo/updateHenkilo").content(inputContent).contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8)).andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void findByOid() throws Exception {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "081296-967T", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1");
        String returnContent = this.objectMapper.writeValueAsString(henkiloDto);
        given(this.henkiloService.getHenkilosByOids(Collections.singletonList("1.2.3.4.5")))
                .willReturn(Collections.singletonList(henkiloDto));
        this.mvc.perform(get("/henkilo/1.2.3.4.5").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(returnContent));
    }

    @Test
    @WithMockUser
    public void findByOidNotFound() throws Exception {
        given(this.henkiloService.getHenkilosByOids(Collections.singletonList("1.2.3.4.5")))
                .willThrow(new NotFoundException());
        this.mvc.perform(get("/henkilo/1.2.3.4.5").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void createHenkiloFromHenkiloDto() throws Exception {
        HenkiloDto henkiloDtoInput = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", null,
                false, "fi", "suomi", "246", "1.2.3.4.1");
        HenkiloDto henkiloDtoOutput = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1");
        given(this.henkiloService.createHenkiloFromHenkiloDto(any(HenkiloDto.class))).willReturn(henkiloDtoOutput);
        this.mvc.perform(post("/henkilo").content(this.objectMapper.writeValueAsString(henkiloDtoInput))
                .contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isCreated()).andExpect(content().string("1.2.3.4.5"));
    }

    @Test
    @WithMockUser
    public void createHenkiloFromHenkiloDtoInvalidInput() throws Exception {
        HenkiloDto henkiloDtoInput = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1");
        this.mvc.perform(post("/henkilo").content(this.objectMapper.writeValueAsString(henkiloDtoInput))
                .contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void findByIdpAndIdentifier() throws Exception {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1");
        given(this.henkiloService.getHenkiloByIDPAndIdentifier("email", "arpa@kuutio.fi")).willReturn(henkiloDto);
        this.mvc.perform(get("/henkilo/identification").param("idp", "email").param("id", "arpa@kuutio.fi"))
                .andExpect(status().isOk()).andExpect(content().json(this.objectMapper.writeValueAsString(henkiloDto)));
    }

    @Test
    @WithMockUser
    public void findByIdpAndIdentifierNotFound() throws Exception {
        given(this.henkiloService.getHenkiloByIDPAndIdentifier("email", "arpa@kuutio.fi")).willThrow(new NotFoundException());
        this.mvc.perform(get("/henkilo/identification").param("idp", "email").param("id", "arpa@kuutio.fi"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void findPossibleHenkiloTypes() throws Exception {
        String resultContent = "[\"VIRKAILIJA\", \"PALVELU\", \"OPPIJA\"]";
        given(this.henkiloService.listPossibleHenkiloTypesAccessible())
                .willReturn(Arrays.asList("VIRKAILIJA", "PALVELU", "OPPIJA"));
        this.mvc.perform(get("/henkilo/henkilotypes").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(resultContent));
    }


}
