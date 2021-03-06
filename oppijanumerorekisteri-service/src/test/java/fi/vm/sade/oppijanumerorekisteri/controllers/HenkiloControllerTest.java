package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl;
import fi.vm.sade.oppijanumerorekisteri.services.impl.UserDetailsHelperImpl;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.validation.BindException;

import javax.validation.ValidationException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.ROLE_OPPIJANUMEROREKISTERI_PREFIX;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.ROOT_ORGANISATION_SUFFIX;
import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static java.util.Optional.empty;
import static java.util.Optional.of;
import static org.hamcrest.CoreMatchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("dev")
@RunWith(SpringRunner.class)
@WebMvcTest(value = HenkiloController.class)
@ContextConfiguration(classes = {OppijanumerorekisteriServiceApplication.class, DevProperties.class, PermissionCheckerImpl.class, UserDetailsHelperImpl.class})
public class HenkiloControllerTest {
    @Autowired
    private MockMvc mvc;

    @MockBean
    private HenkiloService henkiloService;

    @MockBean
    private HenkiloModificationService henkiloModificationService;

    @MockBean
    private DuplicateService duplicateService;

    @MockBean
    private IdentificationService identificationService;

    @Autowired
    private PermissionChecker permissionChecker;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @MockBean
    private HenkiloUpdatePostValidator henkiloUpdatePostValidator;

    @MockBean
    private YksilointiService yksilointiService;

    @Autowired
    private DevProperties devProperties;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrganisaatioRepository organisaatioRepository;

    @MockBean
    private OrganisaatioService organisaatioService;


    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void list() throws Exception {
        this.mvc.perform(get("/henkilo?page=0").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5")
    public void hasHetu() throws Exception {
        given(this.henkiloService.getHasHetu()).willReturn(true);
        this.mvc.perform(get("/henkilo/current/hasHetu").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().string("true"));
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001")
    public void henkiloOidHetuNimiByHetu() throws Exception {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = DtoUtils.createHenkiloOidHetuNimiDto("arpa", "arpa", "kuutio", "081296-967T",
                "1.2.3.4.5");
        String content = "{\"etunimet\": \"arpa\"," +
                "\"kutsumanimi\": \"arpa\"," +
                "\"sukunimi\": \"kuutio\"," +
                "\"hetu\": \"081296-967T\"," +
                "\"oidHenkilo\": \"1.2.3.4.5\"}";
        given(this.henkiloService.getHenkiloOidHetuNimiByHetu("081296-967T")).willReturn(henkiloOidHetuNimiDto);
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/081296-967T").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(content));
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void henkiloOidHetuNimiByHetuNotFound() throws Exception {
        given(this.henkiloService.getHenkiloOidHetuNimiByHetu("081296-967T")).willThrow(new NotFoundException());
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/081296-967T").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findHenkilotByOidList() throws Exception {
        HenkiloPerustietoDto henkiloPerustietoDto = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "081296-967T",
                "1.2.3.4.5", "fi", "suomi", "246", singletonList("externalid1"), emptyList(), null, new Date());
        String inputOidList = "[\"1.2.3.4.5\"]";
        String returnContent = "[" +
                "  {" +
                "    \"aidinkieli\": {" +
                "      \"kieliKoodi\": \"fi\"," +
                "      \"kieliTyyppi\": \"suomi\"" +
                "    }," +
                "    \"asiointiKieli\": {" +
                "      \"kieliKoodi\": \"fi\"," +
                "      \"kieliTyyppi\": \"suomi\"" +
                "    }," +
                "    \"etunimet\": \"arpa\"," +
                "    \"hetu\": \"081296-967T\"," +
                "    \"kutsumanimi\": \"arpa\"," +
                "    \"oidHenkilo\": \"1.2.3.4.5\"," +
                "    \"sukunimi\": \"kuutio\"" +
                "  }" +
                "]";
        given(this.henkiloService.getHenkiloPerustietoByOids(Collections.singletonList("1.2.3.4.5")))
                .willReturn(Collections.singletonList(henkiloPerustietoDto));
        this.mvc.perform(post("/henkilo/henkiloPerustietosByHenkiloOidList").content(inputOidList)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(returnContent));
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void getHenkiloYhteystiedot() throws Exception {
        String content = "{" +
                "  \"yhteystietotyyppi1\": {" +
                "    \"sahkoposti\": \"testi@test.com\"" +
                "  }" +
                "}";
        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.5")).willReturn(new HenkilonYhteystiedotViewDto()
            .put("yhteystietotyyppi1", YhteystiedotDto.builder().sahkoposti("testi@test.com").build()));
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json(content));
        
        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.6")).willReturn(new HenkilonYhteystiedotViewDto());
        this.mvc.perform(get("/henkilo/1.2.3.4.6/yhteystiedot").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json("{}"));
    }
    
    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void getAllHenkiloYhteystiedot() throws Exception {
        String content = "{" +
                "  \"sahkoposti\": \"testi@test.com\"" +
                "}";
        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.5", "yhteystietotyyppi1")).willReturn(
                of(YhteystiedotDto.builder().sahkoposti("testi@test.com").build()));
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/yhteystietotyyppi1").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(content().json(content));

        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.5", "yhteystietotyyppi2")).willReturn(empty());
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/yhteystietotyyppi2").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());

        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.6", "yhteystietotyyppi1")).willReturn(empty());
        this.mvc.perform(get("/henkilo/1.2.3.4.6/yhteystiedot/yhteystietotyyppi1").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
    }

    @Test
    public void unauthorized() throws Exception {
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/081296-967T")
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void updateHenkilo() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = DtoUtils.createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246",
                "arpa@kuutio.fi");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloModificationService.updateHenkilo(any(HenkiloUpdateDto.class))).willReturn(henkiloUpdateDto);
        this.mvc.perform(put("/henkilo").content(inputContent).contentType(MediaType.APPLICATION_JSON_UTF8)
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON_UTF8)).andExpect(status().isOk()).andExpect(content().string("1.2.3.4.5"));
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void updateHenkiloONRValidationException() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = DtoUtils.createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246",
                "arpa@kuutio.fi");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        BindException errors = new BindException(henkiloUpdateDto, "henkiloUpdateDTo");
        errors.rejectValue("hetu", henkiloUpdateDto.getHetu());
        given(this.henkiloModificationService.updateHenkilo(any(HenkiloUpdateDto.class)))
                .willThrow(new fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException(errors));
        this.mvc.perform(put("/henkilo").content(inputContent).contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Field error in object 'henkiloUpdateDTo' on field 'hetu': rejected value [081296-967T];")));
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void updateHenkiloNotFoundException() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = DtoUtils.createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246",
                "arpa@kuutio.fi");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloModificationService.updateHenkilo(any(HenkiloUpdateDto.class))).willThrow(new NotFoundException());
        this.mvc.perform(put("/henkilo")
                .with(csrf())
                .content(inputContent)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void updateHenkiloValidationException() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = DtoUtils.createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246",
                "arpa@kuutio.fi");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloModificationService.updateHenkilo(any(HenkiloUpdateDto.class))).willThrow(new ValidationException());
        this.mvc.perform(put("/henkilo")
                .with(csrf())
                .content(inputContent)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void findByOid() throws Exception {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "081296-967T", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        String returnContent = this.objectMapper.writeValueAsString(henkiloDto);
        given(this.henkiloService.getHenkilosByOids(Collections.singletonList("1.2.3.4.5")))
                .willReturn(Collections.singletonList(henkiloDto));
        this.mvc.perform(get("/henkilo/1.2.3.4.5").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(returnContent));
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void findByOidNotFound() throws Exception {
        given(this.henkiloService.getHenkilosByOids(Collections.singletonList("1.2.3.4.5")))
                .willReturn(new ArrayList<>());
        this.mvc.perform(get("/henkilo/1.2.3.4.5").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void createHenkiloFromHenkiloCreateDto() throws Exception {
        HenkiloCreateDto henkiloDtoInput = DtoUtils.createHenkiloCreateDto("arpa", "arpa", "kuutio", "081296-967T", null,
                false, "fi", "suomi", "246", "arpa@kuutio.fi");
        henkiloDtoInput.setYhteystiedotRyhma(Collections.singleton(YhteystiedotRyhmaDto.builder()
                .ryhmaAlkuperaTieto("alkupera1")
                .ryhmaKuvaus("yhteystietotyyppi4")
                .readOnly(true)
                .yhteystieto(YhteystietoDto.builder()
                        .yhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI)
                        .yhteystietoArvo("yhteystieto")
                        .build())
                .build()));
        HenkiloDto henkiloDtoOutput = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "081296-967T", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        given(this.henkiloModificationService.createHenkilo(any(HenkiloCreateDto.class))).willReturn(henkiloDtoOutput);
        this.mvc.perform(post("/henkilo").content(this.objectMapper.writeValueAsString(henkiloDtoInput))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isCreated()).andExpect(content().string("1.2.3.4.5"));
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void createHenkiloFromHenkiloCreateDtoInvalidInputHetu() throws Exception {
        HenkiloCreateDto henkiloDtoInput = DtoUtils.createHenkiloCreateDto("arpa", "arpa", "kuutio", "bad_hetu", null,
                false, "fi", "suomi", "246", "arpa@kuutio.fi");
        this.mvc.perform(post("/henkilo").content(this.objectMapper.writeValueAsString(henkiloDtoInput))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void createHenkiloShouldValidateYhteystietoTyyppi() throws Exception {
        HenkiloCreateDto henkiloDtoInput = DtoUtils.createHenkiloCreateDto("arpa", "arpa", "kuutio", "081296-967T", null,
                false, "fi", "suomi", "246", "arpa@kuutio.fi");
        henkiloDtoInput.setYhteystiedotRyhma(Collections.singleton(YhteystiedotRyhmaDto.builder()
                .ryhmaAlkuperaTieto("alkupera1")
                .ryhmaKuvaus("yhteystietotyyppi4")
                .readOnly(true)
                .yhteystieto(YhteystietoDto.builder()
                        .yhteystietoTyyppi(null)
                        .yhteystietoArvo("yhteystieto")
                        .build())
                .build()));
        this.mvc.perform(post("/henkilo").content(this.objectMapper.writeValueAsString(henkiloDtoInput))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void findByIdpAndIdentifier() throws Exception {
        HenkiloDto henkiloDto = DtoUtils.createHenkiloDto("arpa", "arpa", "kuutio", "081296-967T", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        given(this.henkiloService.getHenkiloByIDPAndIdentifier("email", "arpa@kuutio.fi")).willReturn(henkiloDto);
        this.mvc.perform(get("/henkilo/identification").param("idp", "email").param("id", "arpa@kuutio.fi"))
                .andExpect(status().isOk()).andExpect(content().json(this.objectMapper.writeValueAsString(henkiloDto)));
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findByIdpAndIdentifierNotFound() throws Exception {
        given(this.henkiloService.getHenkiloByIDPAndIdentifier("email", "arpa@kuutio.fi")).willThrow(new NotFoundException());
        this.mvc.perform(get("/henkilo/identification").param("idp", "email").param("id", "arpa@kuutio.fi"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findPossibleHenkiloTypes() throws Exception {
        String resultContent = "[\"VIRKAILIJA\", \"PALVELU\", \"OPPIJA\"]";
        given(this.henkiloService.listPossibleHenkiloTypesAccessible())
                .willReturn(Arrays.asList("VIRKAILIJA", "PALVELU", "OPPIJA"));
        this.mvc.perform(get("/henkilo/henkilotypes").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(resultContent));
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void oidExists() throws Exception{
        given(this.henkiloService.getOidExists("1.2.3.4.5")).willReturn(true);
        this.mvc.perform(head("/henkilo/1.2.3.4.5").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void oidExistsNotFound() throws Exception{
        given(this.henkiloService.getOidExists("1.2.3.4.5")).willReturn(false);
        this.mvc.perform(head("/henkilo/1.2.3.4.5").accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findHenkilotByHetusList() throws Exception {
        HenkiloPerustietoDto henkiloPerustietoDto = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio", "081296-967T",
                "1.2.3.4.5", "fi", "suomi", "246", singletonList("externalid1"), emptyList(), null, new Date());
        String hetuList = "[\"081296-967T\"]";
        String returnContent = "[" +
                "  {" +
                "    \"aidinkieli\": {" +
                "      \"kieliKoodi\": \"fi\"," +
                "      \"kieliTyyppi\": \"suomi\"" +
                "    }," +
                "    \"asiointiKieli\": {" +
                "      \"kieliKoodi\": \"fi\"," +
                "      \"kieliTyyppi\": \"suomi\"" +
                "    }," +
                "    \"etunimet\": \"arpa\"," +
                "    \"hetu\": \"081296-967T\"," +
                "    \"kutsumanimi\": \"arpa\"," +
                "    \"oidHenkilo\": \"1.2.3.4.5\"," +
                "    \"sukunimi\": \"kuutio\"" +
                "  }" +
                "]";
        given(this.henkiloService.getHenkiloPerustietoByHetus(Collections.singletonList("081296-967T")))
                .willReturn(Collections.singletonList(henkiloPerustietoDto));
        this.mvc.perform(post("/henkilo/henkiloPerustietosByHenkiloHetuList").content(hetuList)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON_UTF8).accept(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk()).andExpect(content().json(returnContent));
    }
}
