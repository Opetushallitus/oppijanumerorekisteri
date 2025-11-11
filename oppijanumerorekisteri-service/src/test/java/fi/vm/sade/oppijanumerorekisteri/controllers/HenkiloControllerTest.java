package fi.vm.sade.oppijanumerorekisteri.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;

import fi.vm.sade.auditlog.Target;
import fi.vm.sade.oppijanumerorekisteri.FilesystemHelper;
import fi.vm.sade.oppijanumerorekisteri.OppijanumerorekisteriServiceApplication;
import fi.vm.sade.oppijanumerorekisteri.audit.OnrOperation;
import fi.vm.sade.oppijanumerorekisteri.audit.VirkailijaAuditLogger;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.DevProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ConflictException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl;
import fi.vm.sade.oppijanumerorekisteri.services.impl.UserDetailsHelperImpl;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.validation.BindException;

import jakarta.validation.ValidationException;

import java.time.LocalDate;
import java.time.Month;
import java.util.*;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.ROLE_OPPIJANUMEROREKISTERI_PREFIX;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.ROOT_ORGANISATION_SUFFIX;
import static java.util.Optional.empty;
import static java.util.Optional.of;
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("dev")
@RunWith(SpringRunner.class)
@WebMvcTest(value = HenkiloController.class)
@ContextConfiguration(classes = {OppijanumerorekisteriServiceApplication.class, DevProperties.class, PermissionCheckerImpl.class, UserDetailsHelperImpl.class})
public class HenkiloControllerTest {
    @Captor
    ArgumentCaptor<Target> auditCaptor;
    @Autowired
    private MockMvc mvc;
    @MockitoBean
    private HenkiloService henkiloService;
    @MockitoBean
    private HenkiloModificationService henkiloModificationService;
    @MockitoBean
    private DuplicateService duplicateService;
    @MockitoBean
    private IdentificationService identificationService;
    @MockitoBean
    private KayttooikeusClient kayttooikeusClient;
    @MockitoBean
    private HenkiloUpdatePostValidator henkiloUpdatePostValidator;
    @MockitoBean
    private YksilointiService yksilointiService;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private OrganisaatioRepository organisaatioRepository;
    @MockitoBean
    private OrganisaatioService organisaatioService;
    @MockitoBean
    private VirkailijaAuditLogger auditLogger;

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA")
    public void list() throws Exception {
        this.mvc.perform(get("/henkilo?page=0").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5")
    public void hasHetu() throws Exception {
        given(this.henkiloService.getHasHetu()).willReturn(true);
        this.mvc.perform(get("/henkilo/current/hasHetu").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content().string("true"));
        verifyReadNoAudit();
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
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(content));

        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.6")).willReturn(new HenkilonYhteystiedotViewDto());
        this.mvc.perform(get("/henkilo/1.2.3.4.6/yhteystiedot").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content().json("{}"));
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void getAllHenkiloYhteystiedot() throws Exception {
        String content = "{" +
                "  \"sahkoposti\": \"testi@test.com\"" +
                "}";
        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.5", "yhteystietotyyppi1")).willReturn(
                of(YhteystiedotDto.builder().sahkoposti("testi@test.com").build()));
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/yhteystietotyyppi1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(content));

        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.5", "yhteystietotyyppi2")).willReturn(empty());
        this.mvc.perform(get("/henkilo/1.2.3.4.5/yhteystiedot/yhteystietotyyppi2").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        given(this.henkiloService.getHenkiloYhteystiedot("1.2.3.4.6", "yhteystietotyyppi1")).willReturn(empty());
        this.mvc.perform(get("/henkilo/1.2.3.4.6/yhteystiedot/yhteystietotyyppi1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        verifyReadNoAudit();
    }

    @Test
    public void unauthorized() throws Exception {
        this.mvc.perform(get("/henkilo/henkiloPerusByHetu/081296-967T")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void updateHenkilo() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246",
                "+358 50 555 7463");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloModificationService.updateHenkilo(any(HenkiloUpdateDto.class))).willReturn(henkiloUpdateDto);
        this.mvc.perform(put("/henkilo").content(inputContent).contentType(MediaType.APPLICATION_JSON)
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk()).andExpect(content().string("1.2.3.4.5"));
        verifyReadNoAudit();
    }

    // This verifies that API validates contact information to some extent
    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void updateHenkiloBadRequest() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246",
                "This should be valid email address");
        henkiloUpdateDto.getYhteystiedotRyhma().stream().findAny()
                .ifPresent(ytr -> ytr.getYhteystieto().stream().findAny()
                        .ifPresent(yt -> yt.setYhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI)));
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloModificationService.updateHenkilo(any(HenkiloUpdateDto.class))).willReturn(henkiloUpdateDto);
        this.mvc.perform(put("/henkilo").content(inputContent).contentType(MediaType.APPLICATION_JSON)
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void updateHenkiloONRValidationException() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246",
                "+358 50 555 7463");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        BindException errors = new BindException(henkiloUpdateDto, "henkiloUpdateDTo");
        errors.rejectValue("hetu", henkiloUpdateDto.getHetu());
        given(this.henkiloModificationService.updateHenkilo(any(HenkiloUpdateDto.class)))
                .willThrow(new fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException(errors));
        this.mvc.perform(put("/henkilo").content(inputContent).contentType(MediaType.APPLICATION_JSON).accept(MediaType.APPLICATION_JSON).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Field error in object 'henkiloUpdateDTo' on field 'hetu': rejected value [081296-967T];")));
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void updateHenkiloNotFoundException() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246",
                "+358 50 555 7463");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloModificationService.updateHenkilo(any(HenkiloUpdateDto.class))).willThrow(new NotFoundException());
        this.mvc.perform(put("/henkilo")
                        .with(csrf())
                        .content(inputContent)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void updateHenkiloValidationException() throws Exception {
        HenkiloUpdateDto henkiloUpdateDto = createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "081296-967T", "1.2.3.4.5", "fi", "suomi", "246",
                "arpa@kuutio.fi");
        String inputContent = this.objectMapper.writeValueAsString(henkiloUpdateDto);
        given(this.henkiloModificationService.updateHenkilo(any(HenkiloUpdateDto.class))).willThrow(new ValidationException());
        this.mvc.perform(put("/henkilo")
                        .with(csrf())
                        .content(inputContent)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void findByOid() throws Exception {
        HenkiloDto henkiloDto = createHenkiloDto("arpa", "arpa", "kuutio", "081296-967T", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        String returnContent = this.objectMapper.writeValueAsString(henkiloDto);
        given(this.henkiloService.getHenkilosByOids(Collections.singletonList("1.2.3.4.5")))
                .willReturn(Collections.singletonList(henkiloDto));
        this.mvc.perform(get("/henkilo/1.2.3.4.5").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(content().json(returnContent));
        verifyReadAudit("1.2.3.4.5");
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void findByOidNotFound() throws Exception {
        given(this.henkiloService.getHenkilosByOids(Collections.singletonList("1.2.3.4.5")))
                .willReturn(new ArrayList<>());
        this.mvc.perform(get("/henkilo/1.2.3.4.5").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void createHenkiloFromHenkiloCreateDto() throws Exception {
        HenkiloCreateDto henkiloDtoInput = createHenkiloCreateDto("arpa", "arpa", "kuutio", "081296-967T", null,
                false, "fi", "suomi", "246", "arpa@kuutio.fi");
        henkiloDtoInput.setYhteystiedotRyhma(Collections.singleton(YhteystiedotRyhmaDto.builder()
                .ryhmaAlkuperaTieto("alkupera1")
                .ryhmaKuvaus("yhteystietotyyppi4")
                .readOnly(true)
                .yhteystieto(YhteystietoDto.builder()
                        .yhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI)
                        .yhteystietoArvo("formally.correct@email.address")
                        .build())
                .build()));
        Henkilo henkiloDtoOutput = Henkilo.builder()
                .oidHenkilo("1.2.3.4.5")
                .hetu("081296-967T")
                .etunimet("arpa")
                .kutsumanimi("arpa")
                .sukunimi("kuutio")
                .aidinkieli(new Kielisyys("fi", "suomi"))
                .asiointiKieli(new Kielisyys("fi", "suomi"))
                .passivoitu(false)
                .kansalaisuus(Set.of(new Kansalaisuus("246")))
                .yhteystiedotRyhma(Sets.newHashSet(new YhteystiedotRyhma(
                        "yhteystietotyyppi2",
                        "alkupera2",
                        false,
                        Collections.singleton(new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, "arpa@kuutio.fi")))))
                .build();
        given(this.henkiloModificationService.createAndYksiloiHenkilo(any(HenkiloCreateDto.class))).willReturn(henkiloDtoOutput);
        this.mvc.perform(post("/henkilo").content(this.objectMapper.writeValueAsString(henkiloDtoInput))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated()).andExpect(content().string("1.2.3.4.5"));
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void createHenkiloFromHenkiloCreateDtoInvalidInputHetu() throws Exception {
        HenkiloCreateDto henkiloDtoInput = createHenkiloCreateDto("arpa", "arpa", "kuutio", "bad_hetu", null,
                false, "fi", "suomi", "246", "arpa@kuutio.fi");
        this.mvc.perform(post("/henkilo").content(this.objectMapper.writeValueAsString(henkiloDtoInput))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void createHenkiloShouldValidateYhteystietoTyyppi() throws Exception {
        HenkiloCreateDto henkiloDtoInput = createHenkiloCreateDto("arpa", "arpa", "kuutio", "081296-967T", null,
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
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void findByIdpAndIdentifier() throws Exception {
        HenkiloDto henkiloDto = createHenkiloDto("arpa", "arpa", "kuutio", "081296-967T", "1.2.3.4.5",
                false, "fi", "suomi", "246", "1.2.3.4.1", "arpa@kuutio.fi");
        given(this.henkiloService.getHenkiloByIDPAndIdentifier(IdpEntityId.email, "arpa@kuutio.fi")).willReturn(henkiloDto);
        this.mvc.perform(get("/henkilo/identification").param("idp", "email").param("id", "arpa@kuutio.fi"))
                .andExpect(status().isOk()).andExpect(content().json(this.objectMapper.writeValueAsString(henkiloDto)));
        verifyReadAudit("1.2.3.4.5");
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findByIdpAndIdentifierNotFound() throws Exception {
        given(this.henkiloService.getHenkiloByIDPAndIdentifier(IdpEntityId.email, "arpa@kuutio.fi")).willThrow(new NotFoundException());
        this.mvc.perform(get("/henkilo/identification").param("idp", "email").param("id", "arpa@kuutio.fi"))
                .andExpect(status().isNotFound());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void findByIdpAndIdentifierInvalidIdpEntityId() throws Exception {
        this.mvc.perform(get("/henkilo/identification").param("idp", "invalid").param("id", "arpa@kuutio.fi"))
                .andExpect(status().isBadRequest());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void addIdentification() throws Exception {
        IdentificationDto identificationDto = IdentificationDto.of(IdpEntityId.eidas, "pier");
        given(this.identificationService.create(eq("1.2.3.4.5"), any())).willReturn(List.of(identificationDto));
        this.mvc.perform(post("/henkilo/1.2.3.4.5/identification")
                        .content("{ \"idpEntityId\": \"eidas\", \"identifier\": \"identifier\" }")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(this.objectMapper.writeValueAsString(List.of(identificationDto))));
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void removeIdentificationWithSlashes() throws Exception {
        given(this.identificationService.remove(eq("1.2.3.4.5"), eq(IdpEntityId.eidas), eq("UK/FI/Lorem0ipsum0"))).willReturn(
                List.of(IdentificationDto.of(IdpEntityId.email, "email"))
        );
        this.mvc.perform(delete("/henkilo/1.2.3.4.5/identification/eidas/UK/FI/Lorem0ipsum0")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        verify(this.identificationService).remove(eq("1.2.3.4.5"), eq(IdpEntityId.eidas), eq("UK/FI/Lorem0ipsum0"));
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void addIdentificationWithInvalidIdpEntityId() throws Exception {
        this.mvc.perform(post("/henkilo/1.2.3.4.5/identification")
                        .content("{ \"idpEntityId\": \"invalid\", \"identifier\": \"identifier\" }")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void oidExists() throws Exception {
        given(this.henkiloService.getOidExists("1.2.3.4.5")).willReturn(true);
        this.mvc.perform(head("/henkilo/1.2.3.4.5").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        verifyReadNoAudit();
    }

    @Test
    @WithMockUser(authorities = ROLE_OPPIJANUMEROREKISTERI_PREFIX + "REKISTERINPITAJA" + ROOT_ORGANISATION_SUFFIX)
    public void oidExistsNotFound() throws Exception {
        given(this.henkiloService.getOidExists("1.2.3.4.5")).willReturn(false);
        this.mvc.perform(head("/henkilo/1.2.3.4.5").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        verifyReadNoAudit();
    }

    @WithMockUser(username = "1.2.3.4.5")
    public void removeAccessRightsNoAccess() throws Exception {
        mvc.perform(delete("/henkilo/{oid}/access", "6.7.8.9.10"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void removeAccessRights() throws Exception {
        mvc.perform(delete("/henkilo/{oid}/access", "6.7.8.9.10")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        verify(henkiloModificationService, times(1)).removeAccessRights("6.7.8.9.10");
    }

    @Test
    public void existenceCheck401() throws Exception {
        mvc.perform(postRequest("/henkilo/exists", existenceCheckDto()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void existenceCheck400() throws Exception {
        mvc.perform(postRequest("/henkilo/exists", Collections.emptyMap()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void existenceCheck200() throws Exception {
        given(yksilointiService.exists(any())).willReturn(Optional.of("1.2.3.4.5"));
        mvc.perform(postRequest("/henkilo/exists", existenceCheckDto()))
                .andExpect(status().isOk())
                .andExpect(content().json(FilesystemHelper.getFixture("/controller/henkilo/existenceCheckOnr.json"), JsonCompareMode.STRICT));
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void existenceCheck204() throws Exception {
        given(yksilointiService.exists(any())).willReturn(Optional.empty());
        mvc.perform(postRequest("/henkilo/exists", existenceCheckDto()))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void existenceCheck404() throws Exception {
        given(yksilointiService.exists(any())).willThrow(new NotFoundException());
        mvc.perform(postRequest("/henkilo/exists", existenceCheckDto()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void existenceCheck409() throws Exception {
        given(yksilointiService.exists(any())).willThrow(new ConflictException());
        mvc.perform(postRequest("/henkilo/exists", existenceCheckDto()))
                .andExpect(status().isConflict());
    }

    @Test
    public void getPassinumerotRequiresAuthentication() throws Exception {
        mvc.perform(get("/henkilo/oid/passinumerot"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void getPassinumerotNotFound() throws Exception {
        given(henkiloService.getEntityByOid("oid")).willThrow(new NotFoundException());
        mvc.perform(get("/henkilo/oid/passinumerot"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void getPassinumerotHappyPath() throws Exception {
        given(henkiloService.getEntityByOid("oid")).willReturn(Henkilo.builder().passinumerot(Set.of("makkara")).build());
        mvc.perform(get("/henkilo/oid/passinumerot"))
                .andExpectAll(
                        status().isOk(),
                        content().string("[\"makkara\"]"));
    }

    @Test
    public void setPassinumerotRequiresAuthentication() throws Exception {
        mvc.perform(postRequest("/henkilo/oid/passinumerot", Set.of()))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void setPassinumerotValidateCollectionNotNull() throws Exception {
        mvc.perform(postRequest("/henkilo/oid/passinumerot", null))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void setPassinumerotValidateCollectionElementNotNull() throws Exception {
        mvc.perform(postRequest("/henkilo/oid/passinumerot", null))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void setPassinumerotValidateCollectionElementNotEmpty() throws Exception {
        mvc.perform(postRequest("/henkilo/oid/passinumerot", Set.of("")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void setPassinumerotValidateCollectionMayBeEmpty() throws Exception {
        given(henkiloService.setPassportNumbers("oid", Set.of())).willReturn(Set.of());
        mvc.perform(postRequest("/henkilo/oid/passinumerot", Set.of()))
                .andExpectAll(
                        status().isOk(),
                        content().string("[]"));
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void setPassinumerotHappyPath() throws Exception {
        Set<String> passinumerot = Set.of("makkara");
        given(henkiloService.setPassportNumbers("oid", passinumerot)).willReturn(passinumerot);
        mvc.perform(postRequest("/henkilo/oid/passinumerot", passinumerot))
                .andExpectAll(
                        status().isOk(),
                        content().string("[\"makkara\"]"));
    }

    private MockHttpServletRequestBuilder postRequest(String endpoint, Object payload) throws Exception {
        return post(endpoint)
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload));
    }

    private HenkiloExistenceCheckDto existenceCheckDto() {
        return HenkiloExistenceCheckDto.builder()
                .hetu("230668-003A")
                .etunimet("a b c")
                .kutsumanimi("b")
                .sukunimi("d")
                .build();
    }

    private void verifyReadAudit(String expected) {
        verify(auditLogger).log(eq(OnrOperation.READ), auditCaptor.capture(), any());
        assertThat(auditCaptor.getValue().asJson().toString(), containsString(expected));
    }

    private void verifyReadNoAudit() {
        verify(auditLogger, never()).log(eq(OnrOperation.READ), any(), any());
    }

    private HenkiloCreateDto createHenkiloCreateDto(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi, String yhteystietoArvo) {
        KielisyysDto aidinkieli = new KielisyysDto(kielikoodi, kielityyppi);

        KansalaisuusDto kansalaisuus = new KansalaisuusDto(kansalaisuuskoodi);
        LocalDate syntymaAika = LocalDate.of(1970, 10, 14);

        YhteystiedotRyhmaDto yhteystiedotRyhmaDto = new YhteystiedotRyhmaDto(1L, "yhteystietotyyppi7", "alkupera2",
                true, Collections.singleton(new YhteystietoDto(YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, yhteystietoArvo)));

        return new HenkiloCreateDto(hetu, passivoitu, etunimet, kutsumanimi, sukunimi, aidinkieli,
                aidinkieli, Collections.singleton(kansalaisuus), syntymaAika, "1",
                null, "1.2.3.4.5", null, false, false,
                false, false, false, null, Collections.singleton(yhteystiedotRyhmaDto), Set.of());
    }

    private HenkiloUpdateDto createHenkiloUpdateDto(String etunimet, String kutsumanimi, String sukunimi, String hetu,
                                                          String oidHenkilo, String kielikoodi, String kielityyppi,
                                                          String kansalaisuuskoodi, String yhteystietoArvo) {
        KielisyysDto aidinkieli = new KielisyysDto(kielikoodi, kielityyppi);
        KielisyysDto asiointikieli = new KielisyysDto(kielikoodi, kielityyppi);
        KansalaisuusDto kansalaisuus = new KansalaisuusDto(kansalaisuuskoodi);
        YhteystiedotRyhmaDto yhteystiedotRyhma = new YhteystiedotRyhmaDto(1L, "yhteystietotyyppi7", "alkupera2",
                true, Collections.singleton(new YhteystietoDto(YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, yhteystietoArvo)));

        LocalDate syntymaAika = LocalDate.of(1970, Month.OCTOBER, 10);

        return new HenkiloUpdateDto(oidHenkilo, null, etunimet, kutsumanimi, sukunimi, hetu,
                syntymaAika, null, "1", null, asiointikieli, aidinkieli,
                Collections.singleton(kansalaisuus), Set.of(yhteystiedotRyhma));
    }

    private HenkiloDto createHenkiloDto(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                    boolean passivoitu, String kielikoodi, String kielityyppi,
                                    String kansalaisuuskoodi, String kasittelija, String yhteystietoArvo) {
        return HenkiloDto.builder()
                .oidHenkilo(oidHenkilo)
                .hetu(hetu)
                .kaikkiHetut(null)
                .passivoitu(passivoitu)
                .etunimet(etunimet)
                .kutsumanimi(kutsumanimi)
                .sukunimi(sukunimi)
                .aidinkieli(new KielisyysDto(kielikoodi, kielityyppi))
                .asiointiKieli(new KielisyysDto(kielikoodi, kielityyppi))
                .kansalaisuus(Collections.singleton(new KansalaisuusDto(kansalaisuuskoodi)))
                .kasittelijaOid(kasittelija)
                .syntymaaika(LocalDate.of(1970, Month.OCTOBER, 10))
                .sukupuoli("1")
                .kotikunta(null)
                .oppijanumero("1.2.3.4.5")
                .turvakielto(null)
                .eiSuomalaistaHetua(false)
                .yksiloity(false)
                .yksiloityVTJ(false)
                .yksilointiYritetty(false)
                .yksiloityEidas(false)
                .eidasTunnisteet(new ArrayList<>())
                .duplicate(false)
                .created(new Date(29364800000L))
                .modified(new Date(29364800000L))
                .vtjsynced(null)
                .yhteystiedotRyhma(Collections.singleton(
                        new YhteystiedotRyhmaDto(
                            1L,
                            "yhteystietotyyppi7",
                            "alkupera2",
                            true,
                            Collections.singleton(
                                new YhteystietoDto(YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, yhteystietoArvo)))))
                .yksilointivirheet(new HashSet<>())
                .passinumerot(null)
                .build();
    }
}
