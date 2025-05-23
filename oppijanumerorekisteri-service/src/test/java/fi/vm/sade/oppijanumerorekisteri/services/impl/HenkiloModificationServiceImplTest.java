package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.KoodistoServiceMock;
import fi.vm.sade.oppijanumerorekisteri.aspects.AuditlogAspectHelper;
import fi.vm.sade.oppijanumerorekisteri.clients.HenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HuoltajaCreatePostValidator;
import org.assertj.core.groups.Tuple;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;

import com.google.common.collect.Lists;

import java.time.LocalDate;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Arrays.asList;
import static java.util.Collections.*;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {OrikaConfiguration.class, KoodistoServiceMock.class})
public class HenkiloModificationServiceImplTest {
    @Autowired
    private OrikaConfiguration mapper;

    @MockitoBean
    private TuontiRepository tuontiRepository;

    @Spy
    @InjectMocks
    private HenkiloModificationServiceImpl service;

    @Mock
    private HenkiloService henkiloService;

    @Mock
    private DuplicateService duplicateService;

    @Mock
    private HenkiloUpdatePostValidator henkiloUpdatePostValidator;

    @Mock
    private HenkiloCreatePostValidator henkiloCreatePostValidator;

    @Mock
    private HuoltajaCreatePostValidator huoltajaCreatePostValidator;

    @Mock
    private HenkiloRepository henkiloDataRepositoryMock;

    @Mock
    private KielisyysRepository kielisyysRepositoryMock;

    @Mock
    private KansalaisuusRepository kansalaisuusRepositoryMock;

    @Mock
    private YksilointitietoRepository yksilointitietoRepositoryMock;

    @Mock
    private KayttooikeusClient kayttooikeusClient;

    @Mock
    private PermissionChecker permissionCheckerMock;

    @Mock
    private UserDetailsHelper userDetailsHelperMock;

    @Mock
    private OidGenerator oidGenerator;

    @Mock
    private OppijanumerorekisteriProperties oppijanumerorekisteriProperties;

    @MockitoBean
    private KansalaisuusRepository kansalaisuusRepository;

    @Mock
    private HenkiloModifiedTopic henkiloModifiedTopic;

    @Mock
    private AuditlogAspectHelper auditlogAspectHelper;

    @Before
    public void setup() {
        ReflectionTestUtils.setField(this.service, "mapper", this.mapper);
    }

    @Test
    public void updateHenkiloShouldSetEmptyHetuToNull() {
        when(henkiloDataRepositoryMock.findByOidHenkiloIsIn(any()))
                .thenReturn(Lists.newArrayList(new Henkilo()));
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        HenkiloUpdateDto input = new HenkiloUpdateDto();
        input.setHetu("");

        HenkiloUpdateDto output = service.updateHenkilo(input);

        assertThat(output.getHetu()).isNull();
        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getHetu()).isNull();
    }

    @Test
    public void updateHenkiloShouldSaveHetu() {
        when(henkiloDataRepositoryMock.findByOidHenkiloIsIn(any()))
                .thenReturn(Lists.newArrayList(new Henkilo()));
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        HenkiloUpdateDto input = new HenkiloUpdateDto();
        input.setHetu("310817A983J");
        input.setSyntymaaika(LocalDate.of(2017, Month.OCTOBER, 6));
        input.setSukunimi("2");

        HenkiloUpdateDto output = service.updateHenkilo(input);

        assertThat(output.getHetu()).isEqualTo("310817A983J");
        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getHetu()).isEqualTo("310817A983J");
        assertThat(saved.getSyntymaaika()).isEqualTo("2017-08-31");
        assertThat(saved.getSukupuoli()).isEqualTo("1");
    }

    @Test
    public void updateHenkiloShouldNullifyEmptyHetu() {
        when(henkiloDataRepositoryMock.findByOidHenkiloIsIn(any()))
                .thenReturn(Lists.newArrayList(new Henkilo()));
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        HenkiloUpdateDto input = new HenkiloUpdateDto();

        input.setHetu("");
        HenkiloUpdateDto output = service.updateHenkilo(input);

        assertThat(output.getHetu()).isEqualTo(null);
        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getHetu()).isEqualTo(null);
    }

    @Test
    public void updateHenkiloShouldSaveSyntymaaika() {
        when(henkiloDataRepositoryMock.findByOidHenkiloIsIn(any()))
                .thenReturn(Lists.newArrayList(new Henkilo()));
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        HenkiloUpdateDto input = new HenkiloUpdateDto();
        input.setSyntymaaika(LocalDate.of(2017, Month.OCTOBER, 4));

        HenkiloUpdateDto output = service.updateHenkilo(input);

        assertThat(output.getSyntymaaika()).isEqualTo("2017-10-04");
        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getSyntymaaika()).isEqualTo("2017-10-04");
    }

    @Test
    public void updateHenkiloShouldSaveSukupuoli() {
        when(henkiloDataRepositoryMock.findByOidHenkiloIsIn(any()))
                .thenReturn(Lists.newArrayList(new Henkilo()));
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        HenkiloUpdateDto input = new HenkiloUpdateDto();
        input.setSukupuoli("1");

        HenkiloUpdateDto output = service.updateHenkilo(input);

        assertThat(output.getSukupuoli()).isEqualTo("1");
        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getSukupuoli()).isEqualTo("1");
    }

    @Test
    public void forceUpdateHenkiloShouldSaveHetu() {
        when(henkiloDataRepositoryMock.findByOidHenkilo(any()))
                .thenReturn(Optional.of(new Henkilo()));
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        when(duplicateService.removeDuplicateHetuAndLink(any(), eq("310817A983J")))
                .thenAnswer(invocation -> {
                    Henkilo h = invocation.getArgument(0);
                    return new DuplicateService.LinkResult(h, Collections.singletonList(h), Collections.emptyList());
                });
        HenkiloForceUpdateDto input = new HenkiloForceUpdateDto();
        input.setHetu("310817A983J");
        input.setSyntymaaika(LocalDate.of(2017, Month.OCTOBER, 6));
        input.setSukunimi("2");

        HenkiloForceReadDto output = service.forceUpdateHenkilo(input);

        assertThat(output.getHetu()).isEqualTo("310817A983J");
        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getHetu()).isEqualTo("310817A983J");
        assertThat(saved.getSyntymaaika()).isEqualTo("2017-08-31");
        assertThat(saved.getSukupuoli()).isEqualTo("1");
    }

    @Test
    public void updateHenkiloShouldUpdateSlaves() {
        when(userDetailsHelperMock.findCurrentUserOid()).thenReturn(Optional.of("käsittelijä"));
        Henkilo input = new Henkilo();
        input.setOidHenkilo("oid1");
        when(henkiloDataRepositoryMock.save(any(Henkilo.class))).thenAnswer(returnsFirstArg());
        Henkilo slave1 = new Henkilo();
        Henkilo slave2 = new Henkilo();
        when(henkiloDataRepositoryMock.findSlavesByMasterOid(any())).thenReturn(asList(slave1, slave2));

        service.update(input);

        ArgumentCaptor<Henkilo> henkiloCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).findSlavesByMasterOid(eq("oid1"));
        verify(henkiloDataRepositoryMock, times(3)).save(henkiloCaptor.capture());
        List<Henkilo> tallennetut = henkiloCaptor.getAllValues();
        assertThat(tallennetut).extracting(Henkilo::getModified).isNotNull();
        assertThat(tallennetut).extracting(Henkilo::getKasittelijaOid).containsOnly("käsittelijä");
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDto() {
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", null, "fi", "suomi", "246", emptyList(), emptyList(), null, new Date());

        given(this.henkiloDataRepositoryMock.findByHetu(henkiloPerustietoDtoMock.getHetu())).willReturn(Optional.empty());
        doAnswer(returnsFirstArg()).when(this.service).createHenkilo(any(Henkilo.class));
        assertThat(this.service.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDtoMock).getDto())
                .usingRecursiveComparison().isEqualTo(henkiloPerustietoDtoMock);
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoHenkiloFoundByOid() {
        LocalDate syntymaaika = LocalDate.now();
        Date modified = new Date();
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", null, null, syntymaaika, modified);
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", modified, modified, "1.2.3.4.1", "arpa@kuutio.fi", syntymaaika);

        given(this.henkiloDataRepositoryMock.findByOidHenkilo(any()))
                .willReturn(Optional.of(henkilo));
        given(this.henkiloService.getEntityByOid(eq("1.2.3.4.5"))).willReturn(henkilo);
        assertThat(this.service.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDtoMock).getDto())
                .usingRecursiveComparison().isEqualTo(henkiloPerustietoDtoMock);
        verify(this.henkiloService).getEntityByOid(eq(henkiloPerustietoDtoMock.getOidHenkilo()));
    }

    @Test(expected = NotFoundException.class)
    public void findOrCreateHenkiloFromPerustietoDtoHenkiloNotFoundByOid() {
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", null, null, null, new Date());
        given(this.henkiloDataRepositoryMock.findByOidHenkilo(any()))
                .willReturn(Optional.empty());
        given(this.henkiloService.getEntityByOid(eq("1.2.3.4.5"))).willThrow(new NotFoundException());
        this.service.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDtoMock);
        verify(this.henkiloDataRepositoryMock).findByOidHenkilo(eq(henkiloPerustietoDtoMock.getOidHenkilo()));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoHenkiloFoundByHetu() {
        LocalDate syntymaaika = LocalDate.now();
        Date modified = new Date();
        HenkiloPerustietoDto henkiloPerustietoDtoInput = DtoUtils.createHenkiloPerustietoDto(null, null, null,
                "123456-9999", null, null, null, null, null, null, syntymaaika, modified);
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "", "fi", "suomi", "246", null, null, syntymaaika, modified);
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "", false,
                "fi", "suomi", "246", modified, new Date(), "1.2.3.4.1", "arpa@kuutio.fi", syntymaaika);


        given(this.henkiloDataRepositoryMock.findByHetu(henkiloPerustietoDtoInput.getHetu())).willReturn(Optional.of(henkilo));
        assertThat(this.service.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDtoInput).getDto())
                .usingRecursiveComparison().isEqualTo(henkiloPerustietoDtoMock);
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoHenkiloFoundByKaikkiHetut() {
        LocalDate syntymaaika = LocalDate.now();
        Date modified = new Date();
        HenkiloPerustietoDto henkiloPerustietoDtoInput = DtoUtils.createHenkiloPerustietoDto(null, null, null,
                "123456-9999", null, null, null, null, null, null, syntymaaika, modified);
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "", "fi", "suomi", "246", null, null, syntymaaika, modified);
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "", false,
                "fi", "suomi", "246", modified, new Date(), "1.2.3.4.1", "arpa@kuutio.fi", syntymaaika);


        given(this.henkiloDataRepositoryMock.findByKaikkiHetut(henkiloPerustietoDtoInput.getHetu())).willReturn(Optional.of(henkilo));
        assertThat(this.service.findOrCreateHenkiloFromPerustietoDto(henkiloPerustietoDtoInput).getDto())
                .usingRecursiveComparison().isEqualTo(henkiloPerustietoDtoMock);
    }

    @Test
    public void createHenkiloShouldSetEmptyHetuToNull() {
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        when(oidGenerator.generateOID()).thenReturn("oid1");
        HenkiloCreateDto input = new HenkiloCreateDto();
        input.setHetu("");

        HenkiloDto output = service.createHenkilo(input);

        assertThat(output.getHetu()).isNull();
        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getHetu()).isNull();
    }

    @Test
    public void createHenkiloShouldSaveHetu() {
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        when(oidGenerator.generateOID()).thenReturn("oid1");
        HenkiloCreateDto input = new HenkiloCreateDto();
        input.setHetu("310817A983J");
        input.setSyntymaaika(LocalDate.of(2017, Month.OCTOBER, 6));
        input.setSukunimi("2");

        HenkiloDto output = service.createHenkilo(input);

        assertThat(output.getHetu()).isEqualTo("310817A983J");
        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getHetu()).isEqualTo("310817A983J");
        assertThat(saved.getSyntymaaika()).isEqualTo("2017-08-31");
        assertThat(saved.getSukupuoli()).isEqualTo("1");
    }

    @Test
    public void createHenkiloShouldSaveSyntymaaika() {
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        when(oidGenerator.generateOID()).thenReturn("oid1");
        HenkiloCreateDto input = new HenkiloCreateDto();
        input.setSyntymaaika(LocalDate.of(2017, Month.OCTOBER, 4));

        HenkiloDto output = service.createHenkilo(input);

        assertThat(output.getSyntymaaika()).isEqualTo("2017-10-04");
        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getSyntymaaika()).isEqualTo("2017-10-04");
    }

    @Test
    public void createHenkiloShouldSaveSukupuoli() {
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        when(oidGenerator.generateOID()).thenReturn("oid1");
        HenkiloCreateDto input = new HenkiloCreateDto();
        input.setSukupuoli("1");

        HenkiloDto output = service.createHenkilo(input);

        assertThat(output.getSukupuoli()).isEqualTo("1");
        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getSukupuoli()).isEqualTo("1");
    }


    @Test
    public void createShouldSkipEmptyPassinumerot() {
        when(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .thenAnswer(returnsFirstArg());
        when(oidGenerator.generateOID()).thenReturn("oid1");
        HenkiloCreateDto input = new HenkiloCreateDto();
        input.setPassinumerot(Stream.of("passi123", null, " ").collect(toSet()));

        service.createHenkilo(input);

        ArgumentCaptor<Henkilo> argumentCaptor = ArgumentCaptor.forClass(Henkilo.class);
        verify(henkiloDataRepositoryMock).save(argumentCaptor.capture());
        Henkilo saved = argumentCaptor.getValue();
        assertThat(saved.getPassinumerot()).containsExactly("passi123");
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldFindByOid() {
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().oidHenkilo("oid1").build();
        Henkilo henkilo = new Henkilo();
        when(henkiloDataRepositoryMock.findByOidHenkilo(any())).thenReturn(Optional.of(henkilo));
        given(this.henkiloService.getEntityByOid(eq("oid1"))).willReturn(henkilo);

        service.findOrCreateHenkiloFromPerustietoDto(input);

        verify(this.henkiloService).getEntityByOid(eq("oid1"));
        verify(henkiloDataRepositoryMock, never()).save(any(Henkilo.class));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldThrowByOid() {
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().oidHenkilo("oid1").build();
        when(henkiloDataRepositoryMock.findByOidHenkilo(any())).thenReturn(Optional.empty());
        given(this.henkiloService.getEntityByOid(eq("oid1"))).willThrow(new NotFoundException());

        Throwable throwable = catchThrowable(() -> service.findOrCreateHenkiloFromPerustietoDto(input));

        assertThat(throwable).isInstanceOf(NotFoundException.class);
        verify(henkiloService).getEntityByOid(eq("oid1"));
        verify(henkiloDataRepositoryMock, never()).save(any(Henkilo.class));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldFindByExternalId() {
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().externalIds(singletonList("externalid1")).build();
        Henkilo henkilo = new Henkilo();
        when(henkiloDataRepositoryMock.findByExternalIds(any())).thenReturn(singleton(henkilo));

        service.findOrCreateHenkiloFromPerustietoDto(input);

        verify(henkiloDataRepositoryMock).findByExternalIds(eq(singletonList("externalid1")));
        verify(henkiloDataRepositoryMock, never()).save(any(Henkilo.class));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldFindByIdentification() {
        IdentificationDto identification = new IdentificationDto();
        identification.setIdpEntityId(IdpEntityId.email);
        identification.setIdentifier("value1");
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().identifications(singletonList(identification)).build();
        Henkilo henkilo = new Henkilo();
        when(henkiloDataRepositoryMock.findByIdentifications(any())).thenReturn(singleton(henkilo));

        service.findOrCreateHenkiloFromPerustietoDto(input);

        verify(henkiloDataRepositoryMock).findByIdentifications(eq(singletonList(identification)));
        verify(henkiloDataRepositoryMock, never()).save(any(Henkilo.class));
    }

    @Test
    public void createHenkiloShouldSetOppijanumero() {
        when(oidGenerator.generateOID()).thenReturn("oid1");
        when(henkiloDataRepositoryMock.save(any(Henkilo.class))).thenAnswer(returnsFirstArg());
        Henkilo input = new Henkilo();
        Henkilo output;

        input.setYksiloity(false);
        output = service.createHenkilo(input);
        assertThat(output)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getOppijanumero, Henkilo::isYksiloity)
                .containsExactly("oid1", null, false);

        input.setYksiloity(true);
        output = service.createHenkilo(input);
        assertThat(output)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getOppijanumero, Henkilo::isYksiloity)
                .containsExactly("oid1", "oid1", true);

        input.setYksiloity(true);
        input.setHetu("241197-9877");
        Throwable throwable1 = catchThrowable(() -> service.createHenkilo(input));
        assertThat(throwable1)
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Henkilöllä on hetu");

        input.setYksiloity(true);
        input.setHetu(null);
        input.setDuplicate(true);
        Throwable throwable2 = catchThrowable(() -> service.createHenkilo(input));
        assertThat(throwable2)
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Henkilö on duplikaatti");
    }

    @Test
    public void generateOid() {
        given(this.oidGenerator.generateOID()).willReturn("oid");
        String oid = ReflectionTestUtils.invokeMethod(service, "getFreePersonOid");
        assertThat(oid).isNotNull();
    }

    @Test
    public void hetullinenHuoltajaLuodaan() {
        given(this.henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(new Henkilo()));
        doReturn(Henkilo.builder().hetu("271198-9197").build()).when(this.service).createHenkilo(any(HuoltajaCreateDto.class));
        given(this.henkiloDataRepositoryMock.findSlavesByMasterOid(any())).willReturn(new ArrayList<>());
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("271198-9197")
                .build();
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));
        this.service.forceUpdateHenkilo(henkiloForceUpdateDto);
        verify(this.service, times(1)).createHenkilo(any(HuoltajaCreateDto.class), any());
    }

    @Test
    public void hetullinenHuoltajaLoytyyEnnestaan() {
        given(this.henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(new Henkilo()));
        given(this.henkiloDataRepositoryMock.findByHetu(eq("271198-9197"))).willReturn(Optional.of(new Henkilo()));
        doReturn(Henkilo.builder().hetu("271198-9197").build()).when(this.service).createHenkilo(any(HuoltajaCreateDto.class));
        given(this.henkiloDataRepositoryMock.findSlavesByMasterOid(any())).willReturn(new ArrayList<>());
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("271198-9197")
                .build();
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));
        this.service.forceUpdateHenkilo(henkiloForceUpdateDto);
        verify(this.henkiloDataRepositoryMock, times(1)).findByHetu(eq("271198-9197"));
        verify(this.service, times(0)).createHenkilo(any(HuoltajaCreateDto.class));
    }

    @Test
    public void hetullinenHuoltajaOnYksiloity() {
        given(this.henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(new Henkilo()));
        given(this.henkiloDataRepositoryMock.findByHetu(eq("271198-9197"))).willReturn(Optional.of(Henkilo.builder().oidHenkilo("oid").build()));
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("271198-9197")
                .etunimet("etunimi")
                .kutsumanimi("etunimi")
                .sukunimi("sukunimi")
                .yksiloityVTJ(true)
                .build();
        Henkilo lapsi = Mockito.mock(Henkilo.class);
        Henkilo huoltaja = this.service.findOrCreateHuoltaja(huoltajaCreateDto, lapsi);
        verify(this.henkiloDataRepositoryMock, times(1)).findByHetu(eq("271198-9197"));
        verify(this.service, times(0)).createHenkilo(any(HuoltajaCreateDto.class));
        verifyNoInteractions(lapsi);
        assertThat(huoltaja)
                .extracting(Henkilo::getEtunimet, Henkilo::getKutsumanimi, Henkilo::getSukunimi, Henkilo::getHetu, Henkilo::isYksiloityVTJ, Henkilo::getOidHenkilo, Henkilo::getSyntymaaika, Henkilo::getSukupuoli)
                .containsExactly("etunimi", "etunimi", "sukunimi", "271198-9197", true, "oid", LocalDate.of(1998, 11, 27), "1");
    }

    @Test
    public void hetutonHuoltajaLuodaan() {
        given(this.henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(new Henkilo()));
        doReturn(Henkilo.builder().etunimet("etunimi").sukunimi("sukunimi").build()).when(this.service).createHenkilo(any(HuoltajaCreateDto.class));
        given(this.henkiloDataRepositoryMock.findSlavesByMasterOid(any())).willReturn(new ArrayList<>());
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .etunimet("etunimi")
                .sukunimi("sukunimi")
                .build();
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));
        this.service.forceUpdateHenkilo(henkiloForceUpdateDto);
        verify(this.service, times(1)).createHenkilo(any(HuoltajaCreateDto.class), any());
    }

    @Test
    public void hetutonHuoltajaLoytyyEnnestaan() {
        Henkilo henkiloResult = new Henkilo();
        henkiloResult.setHuoltajat(Collections.singleton(HenkiloHuoltajaSuhde.builder()
                .lapsi(henkiloResult)
                .huoltaja(Henkilo.builder()
                        .etunimet("etunimi")
                        .sukunimi("sukunimi")
                        .build())
                .build()));
        given(this.henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(henkiloResult));
        doReturn(Henkilo.builder().etunimet("etunimi").sukunimi("sukunimi").build()).when(this.service).createHenkilo(any(HuoltajaCreateDto.class));
        given(this.henkiloDataRepositoryMock.findSlavesByMasterOid(any())).willReturn(new ArrayList<>());
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .etunimet("etunimi")
                .sukunimi("sukunimi")
                .kansalaisuusKoodi(Collections.singleton("246"))
                .syntymaaika(LocalDate.of(2000, 2, 2))
                .build();
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));
        this.service.forceUpdateHenkilo(henkiloForceUpdateDto);
        assertThat(henkiloResult.getHuoltajat().stream().map(HenkiloHuoltajaSuhde::getHuoltaja).collect(Collectors.toList()))
                .extracting(Henkilo::getEtunimet, Henkilo::getSyntymaaika)
                .containsExactly(Tuple.tuple("etunimi", LocalDate.of(2000, 2, 2)));
        verify(this.henkiloDataRepositoryMock, times(0)).findByHetu(any());
        verify(this.service, times(0)).createHenkilo(any(HuoltajaCreateDto.class));
    }

}
