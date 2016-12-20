package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
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
    private IdentificationRepository identificationRepository;
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
    private KoodistoService koodistoService;

    @Before
    public void setup() {
        impl = new HenkiloServiceImpl(henkiloJpaRepository, henkiloRepository, henkiloViiteRepository,
                orikaConfiguration, yhteystietoConverter, oidGenerator,
                userDetailsHelper, kielisyysRepository, koodistoService,
                kansalaisuusRepository, identificationRepository,
                permissionChecker, henkiloUpdatePostValidator);
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
        when(henkiloJpaRepository.findOidsModifiedSince(any(), any())).thenReturn(singletonList("1.2.3"));

        HenkiloCriteria criteria = HenkiloCriteria.builder()
                .henkiloOids(new HashSet<>(asList("1.2.3", "4.5.6"))).build();
        DateTime dt = new DateTime();
        List<String> result = impl.findHenkiloOidsModifiedSince(criteria, dt);

        assertThat(result).isEqualTo(singletonList("1.2.3"));
        verify(henkiloJpaRepository).findOidsModifiedSince(eq(criteria), eq(dt));

        when(henkiloJpaRepository.findOidsModifiedSince(any(), any())).thenReturn(emptyList());
        result = impl.findHenkiloOidsModifiedSince(criteria, dt);
        assertThat(result).hasSize(0);
    }

    @Test
    public void findOrCreateHenkiloFromPerustietoDtoShouldFindByExternalId() {
        HenkiloPerustietoDto input = HenkiloPerustietoDto.builder().externalId("externalid1").build();
        Henkilo henkilo = new Henkilo();
        when(henkiloJpaRepository.findByExternalId(any())).thenReturn(Optional.of(henkilo));

        HenkiloPerustietoDto output = impl.findOrCreateHenkiloFromPerustietoDto(input);

        verify(henkiloJpaRepository).findByExternalId(eq("externalid1"));
        verify(orikaConfiguration).map(eq(henkilo), eq(HenkiloPerustietoDto.class));
        verify(henkiloRepository, never()).save(any(Henkilo.class));
    }

}
