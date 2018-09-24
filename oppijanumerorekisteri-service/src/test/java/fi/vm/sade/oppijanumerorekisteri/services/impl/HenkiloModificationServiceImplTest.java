package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.KoodistoServiceMock;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointitietoRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.utils.DtoUtils;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.Month;
import java.util.*;
import java.util.stream.Stream;

import static java.util.Arrays.asList;
import static java.util.Collections.*;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {OrikaConfiguration.class, KoodistoServiceMock.class}, webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class HenkiloModificationServiceImplTest {
    @Autowired
    private OrikaConfiguration mapper;

    @Spy
    @InjectMocks
    private HenkiloModificationServiceImpl service;

    @Mock
    private HenkiloService henkiloService;

    @Mock
    private HenkiloUpdatePostValidator henkiloUpdatePostValidator;

    @Mock
    private HenkiloCreatePostValidator henkiloCreatePostValidator;

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

    @Before
    public void setup() {
        ReflectionTestUtils.setField(this.service, "mapper", this.mapper);
    }

    @Test
    public void updateHenkiloFromHenkiloUpdateDto() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa noppa", "arpa", "kuutio", "123456-9999",
                "1.2.3.4.5", false, "fi", "suomi", "246",
                new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        long yhteystiedotRyhmaId = henkilo.getYhteystiedotRyhma().stream().mapToLong(YhteystiedotRyhma::getId).max().orElse(0L) + 1;
        henkilo.getYhteystiedotRyhma().add(YhteystiedotRyhma.builder()
                .ryhmaKuvaus("yhteystietotyyppi5").ryhmaAlkuperaTieto("alkupera1")
                .id(yhteystiedotRyhmaId).readOnly(true)
                .yhteystieto(Yhteystieto.builder(YhteystietoTyyppi.YHTEYSTIETO_MAA, "suomi").build())
                .build());
        HenkiloUpdateDto henkiloUpdateDto = DtoUtils.createHenkiloUpdateDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "sv", "svenska", "246",
                "arpa@kuutio.fi");
        henkiloUpdateDto.getYhteystiedotRyhma().add(YhteystiedotRyhmaDto.builder()
                .id(yhteystiedotRyhmaId).readOnly(false)
                .ryhmaKuvaus("readonly").ryhmaAlkuperaTieto("readonly")
                .yhteystieto(YhteystietoDto.builder().yhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_MAA).yhteystietoArvo("ruotsi").build())
                .build());
        ArgumentCaptor<Henkilo> argument = ArgumentCaptor.forClass(Henkilo.class);
        given(this.henkiloDataRepositoryMock.findByOidHenkiloIsIn(Collections.singletonList(henkiloUpdateDto.getOidHenkilo())))
                .willReturn(Collections.singletonList(henkilo));
        given(userDetailsHelperMock.getCurrentUserOid()).willReturn("1.2.3.4.1");
        given(this.kielisyysRepositoryMock.findOrCreateByKoodi(anyString()))
                .willAnswer(invocation -> new Kielisyys(invocation.getArgument(0)));
        given(this.kansalaisuusRepositoryMock.findOrCreate(anyString()))
                .willReturn(EntityUtils.createKansalaisuus("246"));
        given(henkiloDataRepositoryMock.save(any(Henkilo.class)))
                .willAnswer(returnsFirstArg());

        this.service.updateHenkilo(henkiloUpdateDto);
        verify(this.henkiloDataRepositoryMock).save(argument.capture());
        verify(this.kayttooikeusClient, times(1)).ldapSynkroniseHenkilo(eq("1.2.3.4.5"));

        assertThat(argument.getValue().getAidinkieli().getKieliKoodi()).isEqualTo("sv");
        assertThat(argument.getValue().getAsiointiKieli().getKieliKoodi()).isEqualTo("sv");

        assertThat(argument.getValue().getKielisyys().size()).isEqualTo(1);
        assertThat(argument.getValue().getKielisyys().iterator().next().getKieliKoodi()).isEqualTo("sv");

        assertThat(argument.getValue().getKansalaisuus().size()).isEqualTo(1);
        assertThat(argument.getValue().getKansalaisuus().iterator().next().getKansalaisuusKoodi()).isEqualTo("246");

        assertThat(argument.getValue().getYhteystiedotRyhma())
                .extracting("id", "ryhmaAlkuperaTieto", "ryhmaKuvaus")
                .containsExactlyInAnyOrder(
                        tuple(null, "alkupera2", "yhteystietotyyppi7"),
                        tuple(yhteystiedotRyhmaId, "alkupera1", "yhteystietotyyppi5"));

        assertThat(argument.getValue().getYhteystiedotRyhma())
                .flatExtracting("yhteystieto").extracting("yhteystietoTyyppi", "yhteystietoArvo")
                .containsExactlyInAnyOrder(
                        tuple(YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, "arpa@kuutio.fi"),
                        tuple(YhteystietoTyyppi.YHTEYSTIETO_MAA, "suomi"));
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
    public void updateHenkiloShouldUpdateSlaves() {
        when(userDetailsHelperMock.findCurrentUserOid()).thenReturn(Optional.of("käsittelijä"));
        Henkilo input = new Henkilo();
        input.setOidHenkilo("oid1");
        when(henkiloDataRepositoryMock.save(any(Henkilo.class))).thenAnswer(returnsFirstArg());
        Henkilo slave1 = new Henkilo();
        Henkilo slave2 = new Henkilo();
        when(henkiloDataRepositoryMock.findSlavesByMasterOid(any())).thenReturn(asList(slave1, slave2));

        Henkilo output = service.update(input);

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
                .isEqualToComparingFieldByFieldRecursively(henkiloPerustietoDtoMock);
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
                .isEqualToComparingFieldByFieldRecursively(henkiloPerustietoDtoMock);
        verify(this.henkiloService).getEntityByOid(eq(henkiloPerustietoDtoMock.getOidHenkilo()));
    }

    @Test(expected = NotFoundException.class)
    public void findOrCreateHenkiloFromPerustietoDtoHenkiloNotFoundByOid() {
        HenkiloPerustietoDto henkiloPerustietoDtoMock = DtoUtils.createHenkiloPerustietoDto("arpa", "arpa", "kuutio",
                "123456-9999", "1.2.3.4.5", "fi", "suomi", "246", null, null, null, new Date());
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");

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
                .isEqualToComparingFieldByFieldRecursively(henkiloPerustietoDtoMock);
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

        HenkiloDto output = service.createHenkilo(input);

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

        FindOrCreateWrapper<HenkiloPerustietoDto> output = service.findOrCreateHenkiloFromPerustietoDto(input);

        verify(this.henkiloService).getEntityByOid(eq("oid1"));
        verify(henkiloDataRepositoryMock, never()).save(any(Henkilo.class));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldThrowByOid() {
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().oidHenkilo("oid1").build();
        Henkilo henkilo = new Henkilo();
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

        FindOrCreateWrapper<HenkiloPerustietoDto> output = service.findOrCreateHenkiloFromPerustietoDto(input);

        verify(henkiloDataRepositoryMock).findByExternalIds(eq(singletonList("externalid1")));
        verify(henkiloDataRepositoryMock, never()).save(any(Henkilo.class));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldFindByIdentification() {
        IdentificationDto identification = new IdentificationDto();
        identification.setIdpEntityId("key");
        identification.setIdentifier("value1");
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().identifications(singletonList(identification)).build();
        Henkilo henkilo = new Henkilo();
        when(henkiloDataRepositoryMock.findByIdentifications(any())).thenReturn(singleton(henkilo));

        FindOrCreateWrapper<HenkiloPerustietoDto> output = service.findOrCreateHenkiloFromPerustietoDto(input);

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
        doReturn(Henkilo.builder().hetu("huoltajanhetu").build()).when(this.service).createHenkilo(any(HuoltajaCreateDto.class));
        given(this.henkiloDataRepositoryMock.findSlavesByMasterOid(any())).willReturn(new ArrayList<>());
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("huoltajanhetu")
                .build();
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));
        this.service.forceUpdateHenkilo(henkiloForceUpdateDto);
        verify(this.service, times(1)).createHenkilo(any(HuoltajaCreateDto.class));
    }

    @Test
    public void hetullinenHuoltajaLoytyyEnnestaan() {
        given(this.henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(new Henkilo()));
        given(this.henkiloDataRepositoryMock.findByHetu(eq("huoltajanhetu"))).willReturn(Optional.of(new Henkilo()));
        doReturn(Henkilo.builder().hetu("huoltajanhetu").build()).when(this.service).createHenkilo(any(HuoltajaCreateDto.class));
        given(this.henkiloDataRepositoryMock.findSlavesByMasterOid(any())).willReturn(new ArrayList<>());
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("huoltajanhetu")
                .build();
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));
        this.service.forceUpdateHenkilo(henkiloForceUpdateDto);
        verify(this.henkiloDataRepositoryMock, times(1)).findByHetu(eq("huoltajanhetu"));
        verify(this.service, times(0)).createHenkilo(any(HuoltajaCreateDto.class));
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
        verify(this.service, times(1)).createHenkilo(any(HuoltajaCreateDto.class));
    }

}
