package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.clients.HakuappClient;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloHakuDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloCreatePostValidator;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import org.joda.time.DateTime;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class HenkiloServiceImplTest {

    @InjectMocks
    private HenkiloServiceImpl impl;

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
    @Mock
    private HakuappClient hakuappClient;
    @Mock
    private AtaruClient ataruClient;

    @Test
    public void getShouldReturnThrowWhenNoHenkilo() {
        when(henkiloRepository.findBy(any(OppijaCriteria.class), anyLong(), anyLong()))
                .thenReturn(emptyList());

        Throwable throwable = catchThrowable(() -> impl.getByHakutermi("haku1"));

        assertThat(throwable).isInstanceOf(NotFoundException.class);
        verifyNoInteractions(permissionChecker);
    }

    @Test
    public void getShouldThrowWhenMultipleHenkilo() {
        when(henkiloRepository.findBy(any(OppijaCriteria.class), anyLong(), anyLong()))
                .thenReturn(Arrays.asList(
                        HenkiloHakuDto.builder().oidHenkilo("1.2.3.4").build(),
                        HenkiloHakuDto.builder().oidHenkilo("5.6.7.8").build()
                ));

        Throwable throwable = catchThrowable(() -> impl.getByHakutermi("haku1"));

        assertThat(throwable).isInstanceOf(NotFoundException.class);
        verifyNoInteractions(permissionChecker);
    }

    @Test
    public void getShouldReturnHenkilo() {
        when(henkiloRepository.findBy(any(OppijaCriteria.class), anyLong(), anyLong()))
                .thenReturn(Lists.newArrayList(HenkiloHakuDto.builder().oidHenkilo("1.2.3.4").build()));

        HenkiloHakuDto henkilo = impl.getByHakutermi("haku1");

        assertThat(henkilo.getOidHenkilo()).isEqualTo("1.2.3.4");
    }

    @Test
    public void getMasterByOidShouldReturnBySlaveOidWhenSlaveAvailable() {
        String oid = "oid1";
        Henkilo entity = new Henkilo();
        when(henkiloRepository.findMasterBySlaveOid(any())).thenReturn(Optional.of(entity));

        HenkiloReadDto dto = impl.getMasterByOid(oid);

        verify(henkiloRepository).findMasterBySlaveOid(eq(oid));
        verify(henkiloRepository, never()).findByOidHenkilo(any());
        verify(orikaConfiguration).map(eq(entity), any());
    }

    @Test
    public void getMasterByOidShouldReturnByMasterOidWhenSlaveNotAvailable() {
        String oid = "oid1";
        Henkilo entity = new Henkilo();
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(entity));
        when(henkiloRepository.findMasterBySlaveOid(any())).thenReturn(Optional.empty());

        HenkiloReadDto dto = impl.getMasterByOid(oid);

        verify(henkiloRepository).findMasterBySlaveOid(eq(oid));
        verify(henkiloRepository).findByOidHenkilo(eq(oid));
        verify(orikaConfiguration).map(eq(entity), any());
    }

    @Test
    public void getMasterByOidShouldThrowWhenMasterOrSlaveNotFound() {
        String oid = "oid1";
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.empty());
        when(henkiloRepository.findMasterBySlaveOid(any())).thenReturn(Optional.empty());

        Throwable throwable = catchThrowable(() -> impl.getMasterByOid(oid));

        assertThat(throwable).isInstanceOf(NotFoundException.class);
        verify(henkiloRepository).findMasterBySlaveOid(eq(oid));
        verify(henkiloRepository).findByOidHenkilo(eq(oid));
        verifyNoInteractions(orikaConfiguration);
    }

    @Test
    public void findHenkiloOidsModifiedSinceTest() {
        when(henkiloRepository.findOidsModifiedSince(any(), any(), any(), any())).thenReturn(singletonList("1.2.3"));

        HenkiloCriteria criteria = HenkiloCriteria.builder()
                .henkiloOids(new HashSet<>(asList("1.2.3", "4.5.6"))).build();
        DateTime dt = new DateTime();
        List<String> result = impl.findHenkiloOidsModifiedSince(criteria, dt, null, null);

        assertThat(result).isEqualTo(singletonList("1.2.3"));
        verify(henkiloRepository).findOidsModifiedSince(eq(criteria), eq(dt), eq(null), eq(null));

        when(henkiloRepository.findOidsModifiedSince(any(), any(), any(), any())).thenReturn(emptyList());
        result = impl.findHenkiloOidsModifiedSince(criteria, dt, null, null);
        assertThat(result).hasSize(0);
    }

}
