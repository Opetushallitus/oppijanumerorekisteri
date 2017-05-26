package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.FindOrCreateWrapper;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHakuDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ForbiddenException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import java.io.IOException;
import java.util.Arrays;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static java.util.Collections.singleton;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class HenkiloServiceImplTest {

    private HenkiloServiceImpl impl;

    @Mock
    private HenkiloJpaRepository henkiloJpaRepository;
    @Mock
    private HenkiloViiteRepository henkiloViiteRepository;
    @Mock
    private HenkiloRepository henkiloRepository;
    @Mock
    private KielisyysRepository kielisyysRepository;
    @Mock
    private KansalaisuusRepository kansalaisuusRepository;
    @Mock
    private OrikaConfiguration orikaConfiguration;
    @Mock
    private YhteystietoConverter yhteystietoConverter;
    @Mock
    private OidGenerator oidGenerator;
    @Mock
    private UserDetailsHelper userDetailsHelper;
    @Mock
    private PermissionChecker permissionChecker;
    @Mock
    private HenkiloUpdatePostValidator henkiloUpdatePostValidator;
    @Mock
    private HenkiloCreatePostValidator henkiloCreatePostValidator;
    @Mock
    private OppijanumerorekisteriProperties oppijanumerorekisteriProperties;
    @Mock
    private KayttooikeusClient kayttooikeusClient;

    @Before
    public void setup() {
        impl = new HenkiloServiceImpl(henkiloJpaRepository, henkiloRepository, henkiloViiteRepository,
                orikaConfiguration, yhteystietoConverter, oidGenerator,
                userDetailsHelper, kielisyysRepository, kansalaisuusRepository,
                permissionChecker, henkiloUpdatePostValidator, henkiloCreatePostValidator, oppijanumerorekisteriProperties,
                kayttooikeusClient);
    }

    @Test
    public void getShouldReturnThrowWhenNoHenkilo() {
        when(henkiloJpaRepository.findBy(any(OppijaCriteria.class), anyLong(), anyLong()))
                .thenReturn(emptyList());

        Throwable throwable = catchThrowable(() -> impl.getByHakutermi("haku1", ExternalPermissionService.SURE));

        assertThat(throwable).isInstanceOf(NotFoundException.class);
        verifyZeroInteractions(permissionChecker);
    }

    @Test
    public void getShouldThrowWhenMultipleHenkilo() {
        when(henkiloJpaRepository.findBy(any(OppijaCriteria.class), anyLong(), anyLong()))
                .thenReturn(Arrays.asList(
                        HenkiloHakuDto.builder().oidHenkilo("1.2.3.4").build(),
                        HenkiloHakuDto.builder().oidHenkilo("5.6.7.8").build()
                ));

        Throwable throwable = catchThrowable(() -> impl.getByHakutermi("haku1", ExternalPermissionService.SURE));

        assertThat(throwable).isInstanceOf(NotFoundException.class);
        verifyZeroInteractions(permissionChecker);
    }

    @Test
    public void getShouldReturnHenkiloWhenPermissionGranted() throws IOException {
        when(henkiloJpaRepository.findBy(any(OppijaCriteria.class), anyLong(), anyLong()))
                .thenReturn(Arrays.asList(HenkiloHakuDto.builder().oidHenkilo("1.2.3.4").build()));
        when(permissionChecker.isAllowedToAccessPerson(any(), any(), any()))
                .thenReturn(true);

        HenkiloHakuDto henkilo = impl.getByHakutermi("haku1", ExternalPermissionService.SURE);

        assertThat(henkilo.getOidHenkilo()).isEqualTo("1.2.3.4");
        verify(permissionChecker).isAllowedToAccessPerson(eq("1.2.3.4"), any(), eq(ExternalPermissionService.SURE));
    }

    @Test
    public void getShouldThrowWhenPermissionDenied() throws IOException {
        when(henkiloJpaRepository.findBy(any(OppijaCriteria.class), anyLong(), anyLong()))
                .thenReturn(Arrays.asList(HenkiloHakuDto.builder().oidHenkilo("1.2.3.4").build()));
        when(permissionChecker.isAllowedToAccessPerson(any(), any(), any()))
                .thenReturn(false);

        Throwable throwable = catchThrowable(() -> impl.getByHakutermi("haku1", ExternalPermissionService.SURE));

        assertThat(throwable).isInstanceOf(ForbiddenException.class);
        verify(permissionChecker).isAllowedToAccessPerson(eq("1.2.3.4"), any(), eq(ExternalPermissionService.SURE));
    }

    @Test
    public void getMasterByOidShouldReturnBySlaveOidWhenSlaveAvailable() {
        String oid = "oid1";
        Henkilo entity = new Henkilo();
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(new Henkilo()));
        when(henkiloJpaRepository.findMasterBySlaveOid(any())).thenReturn(Optional.of(entity));

        HenkiloReadDto dto = impl.getMasterByOid(oid);

        verify(henkiloJpaRepository).findMasterBySlaveOid(eq(oid));
        verify(henkiloRepository, never()).findByOidHenkilo(any());
        verify(orikaConfiguration).map(eq(entity), any());
    }

    @Test
    public void getMasterByOidShouldReturnByMasterOidWhenSlaveNotAvailable() {
        String oid = "oid1";
        Henkilo entity = new Henkilo();
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(entity));
        when(henkiloJpaRepository.findMasterBySlaveOid(any())).thenReturn(Optional.empty());

        HenkiloReadDto dto = impl.getMasterByOid(oid);

        verify(henkiloJpaRepository).findMasterBySlaveOid(eq(oid));
        verify(henkiloRepository).findByOidHenkilo(eq(oid));
        verify(orikaConfiguration).map(eq(entity), any());
    }

    @Test
    public void getMasterByOidShouldThrowWhenMasterOrSlaveNotFound() {
        String oid = "oid1";
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.empty());
        when(henkiloJpaRepository.findMasterBySlaveOid(any())).thenReturn(Optional.empty());

        Throwable throwable = catchThrowable(() -> impl.getMasterByOid(oid));

        assertThat(throwable).isInstanceOf(NotFoundException.class);
        verify(henkiloJpaRepository).findMasterBySlaveOid(eq(oid));
        verify(henkiloRepository).findByOidHenkilo(eq(oid));
        verifyZeroInteractions(orikaConfiguration);
    }

    @Test
    public void findHenkiloOidsModifiedSinceTest() {
        when(henkiloJpaRepository.findOidsModifiedSince(any(), any(), any(), any())).thenReturn(singletonList("1.2.3"));

        HenkiloCriteria criteria = HenkiloCriteria.builder()
                .henkiloOids(new HashSet<>(asList("1.2.3", "4.5.6"))).build();
        DateTime dt = new DateTime();
        List<String> result = impl.findHenkiloOidsModifiedSince(criteria, dt, null, null);

        assertThat(result).isEqualTo(singletonList("1.2.3"));
        verify(henkiloJpaRepository).findOidsModifiedSince(eq(criteria), eq(dt), eq(null), eq(null));

        when(henkiloJpaRepository.findOidsModifiedSince(any(), any(), any(), any())).thenReturn(emptyList());
        result = impl.findHenkiloOidsModifiedSince(criteria, dt, null, null);
        assertThat(result).hasSize(0);
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldFindByOid() {
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().oidHenkilo("oid1").build();
        Henkilo henkilo = new Henkilo();
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(henkilo));
        when(orikaConfiguration.map(any(), eq(HenkiloPerustietoDto.class))).thenReturn(new HenkiloPerustietoDto());

        FindOrCreateWrapper<HenkiloPerustietoDto> output = impl.findOrCreateHenkiloFromPerustietoDto(input);

        verify(henkiloRepository).findByOidHenkilo(eq("oid1"));
        verify(orikaConfiguration).map(eq(henkilo), eq(HenkiloPerustietoDto.class));
        verify(henkiloRepository, never()).save(any(Henkilo.class));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldThrowByOid() {
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().oidHenkilo("oid1").build();
        Henkilo henkilo = new Henkilo();
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.empty());
        when(orikaConfiguration.map(any(), eq(HenkiloPerustietoDto.class))).thenReturn(new HenkiloPerustietoDto());

        Throwable throwable = catchThrowable(() -> impl.findOrCreateHenkiloFromPerustietoDto(input));

        assertThat(throwable).isInstanceOf(NotFoundException.class);
        verify(henkiloRepository).findByOidHenkilo(eq("oid1"));
        verify(henkiloRepository, never()).save(any(Henkilo.class));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldFindByExternalId() {
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().externalIds(singletonList("externalid1")).build();
        Henkilo henkilo = new Henkilo();
        when(henkiloJpaRepository.findByExternalIds(any())).thenReturn(singleton(henkilo));
        when(orikaConfiguration.map(any(), eq(HenkiloPerustietoDto.class))).thenReturn(new HenkiloPerustietoDto());

        FindOrCreateWrapper<HenkiloPerustietoDto> output = impl.findOrCreateHenkiloFromPerustietoDto(input);

        verify(henkiloJpaRepository).findByExternalIds(eq(singletonList("externalid1")));
        verify(orikaConfiguration).map(eq(henkilo), eq(HenkiloPerustietoDto.class));
        verify(henkiloRepository, never()).save(any(Henkilo.class));
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldFindByIdentification() {
        IdentificationDto identification = new IdentificationDto();
        identification.setIdpEntityId("key");
        identification.setIdentifier("value1");
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().identifications(singletonList(identification)).build();
        Henkilo henkilo = new Henkilo();
        when(henkiloJpaRepository.findByIdentifications(any())).thenReturn(singleton(henkilo));
        when(orikaConfiguration.map(any(), eq(HenkiloPerustietoDto.class))).thenReturn(new HenkiloPerustietoDto());

        FindOrCreateWrapper<HenkiloPerustietoDto> output = impl.findOrCreateHenkiloFromPerustietoDto(input);

        verify(henkiloJpaRepository).findByIdentifications(eq(singletonList(identification)));
        verify(orikaConfiguration).map(eq(henkilo), eq(HenkiloPerustietoDto.class));
        verify(henkiloRepository, never()).save(any(Henkilo.class));
    }

}
