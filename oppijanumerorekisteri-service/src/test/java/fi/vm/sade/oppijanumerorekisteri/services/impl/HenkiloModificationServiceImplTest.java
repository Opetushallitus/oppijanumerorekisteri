package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.aspects.AuditlogAspectHelper;
import fi.vm.sade.oppijanumerorekisteri.clients.HenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HuoltajaCreatePostValidator;

import org.assertj.core.groups.Tuple;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
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

@Sql("/sql/truncate_data.sql")
@Sql("/sql/henkilo-controller-test.sql")
@SpringBootTest
public class HenkiloModificationServiceImplTest {
    @MockitoBean
    private TuontiRepository tuontiRepository;

    @Autowired
    private HenkiloModificationService service;

    @MockitoBean
    private HenkiloService henkiloService;

    @MockitoBean
    private DuplicateService duplicateService;

    @MockitoBean
    private HenkiloUpdatePostValidator henkiloUpdatePostValidator;

    @MockitoBean
    private HenkiloCreatePostValidator henkiloCreatePostValidator;

    @MockitoBean
    private HuoltajaCreatePostValidator huoltajaCreatePostValidator;

    @MockitoBean
    private HenkiloRepository henkiloDataRepositoryMock;

    @MockitoBean
    private YksilointitietoRepository yksilointitietoRepositoryMock;

    @MockitoBean
    private KayttooikeusClient kayttooikeusClient;

    @MockitoBean
    private PermissionChecker permissionCheckerMock;

    @MockitoBean
    private UserDetailsHelper userDetailsHelperMock;

    @MockitoBean
    private OidGenerator oidGenerator;

    @MockitoBean
    private KansalaisuusRepository kansalaisuusRepository;

    @MockitoBean
    private HenkiloModifiedTopic henkiloModifiedTopic;

    @MockitoBean
    private AuditlogAspectHelper auditlogAspectHelper;

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
        HenkiloPerustietoCreateDto input = HenkiloPerustietoCreateDto.builder().oidHenkilo("oid1").build();
        Henkilo henkilo = new Henkilo();
        when(henkiloDataRepositoryMock.findByOidHenkilo(any())).thenReturn(Optional.of(henkilo));
        given(henkiloService.getEntityByOid(eq("oid1"))).willReturn(henkilo);

        service.findOrCreateHenkiloFromPerustietoDto(input, false);

        verify(henkiloService).getEntityByOid(eq("oid1"));
        verify(henkiloDataRepositoryMock, never()).save(any(Henkilo.class));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldThrowByOid() {
        HenkiloPerustietoCreateDto input = HenkiloPerustietoCreateDto.builder().oidHenkilo("oid1").build();
        when(henkiloDataRepositoryMock.findByOidHenkilo(any())).thenReturn(Optional.empty());
        given(henkiloService.getEntityByOid(eq("oid1"))).willThrow(new NotFoundException());

        Throwable throwable = catchThrowable(() -> service.findOrCreateHenkiloFromPerustietoDto(input, false));

        assertThat(throwable).isInstanceOf(NotFoundException.class);
        verify(henkiloService).getEntityByOid(eq("oid1"));
        verify(henkiloDataRepositoryMock, never()).save(any(Henkilo.class));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldFindByIdentification() {
        IdentificationDto identification = new IdentificationDto();
        identification.setIdpEntityId(IdpEntityId.email);
        identification.setIdentifier("value1");
        HenkiloPerustietoCreateDto input = HenkiloPerustietoCreateDto.builder().identifications(singletonList(identification)).build();
        Henkilo henkilo = new Henkilo();
        when(henkiloDataRepositoryMock.findByIdentifications(any())).thenReturn(singleton(henkilo));

        service.findOrCreateHenkiloFromPerustietoDto(input, false);

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
    }

    @Test
    public void generateOid() {
        given(oidGenerator.generateOID()).willReturn("oid");
        String oid = ReflectionTestUtils.invokeMethod(service, "getFreePersonOid");
        assertThat(oid).isNotNull();
    }

    @Test
    public void hetullinenHuoltajaLuodaan() {
        given(henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(new Henkilo()));
        given(henkiloDataRepositoryMock.findSlavesByMasterOid(any())).willReturn(new ArrayList<>());
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("271198-9197")
                .build();
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));
        service.forceUpdateHenkilo(henkiloForceUpdateDto);
        verify(henkiloDataRepositoryMock, times(2)).save(any(Henkilo.class));
        verify(auditlogAspectHelper, times(1)).logCreateHenkilo(any(), any());
    }

    @Test
    public void hetullinenHuoltajaLoytyyEnnestaan() {
        given(henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(new Henkilo()));
        given(henkiloDataRepositoryMock.findByHetu(eq("271198-9197"))).willReturn(Optional.of(new Henkilo()));
        given(henkiloDataRepositoryMock.findSlavesByMasterOid(any())).willReturn(new ArrayList<>());
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("271198-9197")
                .build();
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));
        service.forceUpdateHenkilo(henkiloForceUpdateDto);
        verify(henkiloDataRepositoryMock, times(1)).findByHetu(eq("271198-9197"));
        verify(auditlogAspectHelper, times(0)).logCreateHenkilo(any(), any());
    }

    @Test
    public void hetullinenHuoltajaOnYksiloity() {
        given(henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(new Henkilo()));
        given(henkiloDataRepositoryMock.findByHetu(eq("271198-9197"))).willReturn(Optional.of(Henkilo.builder().oidHenkilo("oid").build()));
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("271198-9197")
                .etunimet("etunimi")
                .kutsumanimi("etunimi")
                .sukunimi("sukunimi")
                .yksiloityVTJ(true)
                .build();
        Henkilo lapsi = Mockito.mock(Henkilo.class);
        Henkilo huoltaja = service.findOrCreateHuoltaja(huoltajaCreateDto, lapsi);
        verify(henkiloDataRepositoryMock, times(1)).findByHetu(eq("271198-9197"));
        verify(auditlogAspectHelper, times(0)).logCreateHenkilo(any(), any());
        verifyNoInteractions(lapsi);
        assertThat(huoltaja)
                .extracting(Henkilo::getEtunimet, Henkilo::getKutsumanimi, Henkilo::getSukunimi, Henkilo::getHetu, Henkilo::isYksiloityVTJ, Henkilo::getOidHenkilo, Henkilo::getSyntymaaika, Henkilo::getSukupuoli)
                .containsExactly("etunimi", "etunimi", "sukunimi", "271198-9197", true, "oid", LocalDate.of(1998, 11, 27), "1");
    }

    @Test
    public void hetutonHuoltajaLuodaan() {
        given(henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(new Henkilo()));
        given(henkiloDataRepositoryMock.findSlavesByMasterOid(any())).willReturn(new ArrayList<>());
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .etunimet("etunimi")
                .sukunimi("sukunimi")
                .build();
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));
        service.forceUpdateHenkilo(henkiloForceUpdateDto);
        verify(auditlogAspectHelper, times(1)).logCreateHenkilo(any(), any());
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
        given(henkiloDataRepositoryMock.findByOidHenkilo(any())).willReturn(Optional.of(henkiloResult));
        given(henkiloDataRepositoryMock.findSlavesByMasterOid(any())).willReturn(new ArrayList<>());
        given(henkiloDataRepositoryMock.save(any(Henkilo.class))).willAnswer(returnsFirstArg());

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .etunimet("etunimi")
                .sukunimi("sukunimi")
                .kansalaisuusKoodi(Collections.singleton("246"))
                .syntymaaika(LocalDate.of(2000, 2, 2))
                .build();
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));
        service.forceUpdateHenkilo(henkiloForceUpdateDto);
        assertThat(henkiloResult.getHuoltajat().stream().map(HenkiloHuoltajaSuhde::getHuoltaja).collect(Collectors.toList()))
                .extracting(Henkilo::getEtunimet, Henkilo::getSyntymaaika)
                .containsExactly(Tuple.tuple("etunimi", LocalDate.of(2000, 2, 2)));
        verify(henkiloDataRepositoryMock, times(0)).findByHetu(any());
        verify(auditlogAspectHelper, times(0)).logCreateHenkilo(any(), any());
    }

}
