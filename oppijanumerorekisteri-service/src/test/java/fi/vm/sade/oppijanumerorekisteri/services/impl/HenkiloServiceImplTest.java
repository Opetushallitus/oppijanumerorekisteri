package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.IdentificationRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.OidGenerator;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import fi.vm.sade.oppijanumerorekisteri.validators.HenkiloUpdatePostValidator;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;
import org.mockito.runners.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class HenkiloServiceImplTest {

    private HenkiloServiceImpl impl;

    @Mock
    private HenkiloJpaRepository henkiloJpaRepository;
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
        impl = new HenkiloServiceImpl(henkiloJpaRepository, henkiloRepository,
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

}
