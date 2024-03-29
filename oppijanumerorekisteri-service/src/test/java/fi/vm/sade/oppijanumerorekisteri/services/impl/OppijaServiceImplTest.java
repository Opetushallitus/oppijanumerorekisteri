package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.dto.MasterHenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.Page;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import fi.vm.sade.oppijanumerorekisteri.validators.OppijaTuontiCreatePostValidator;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import static java.util.Arrays.asList;
import static java.util.Collections.emptySet;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class OppijaServiceImplTest {

    private OppijaServiceImpl oppijaServiceImpl;

    @Mock
    private HenkiloModificationService henkiloModificationServiceMock;
    @Mock
    private OrganisaatioService organisaatioServiceMock;
    @Mock
    private OrikaConfiguration mapperMock;
    @Mock
    private HenkiloRepository henkiloRepositoryMock;
    @Mock
    private TuontiRepository tuontiRepositoryMock;
    @Mock
    private OrganisaatioRepository organisaatioRepositoryMock;
    @Mock
    private HenkiloViiteRepository henkiloViiteRepositoryMock;
    @Mock
    private UserDetailsHelper userDetailsHelperMock;
    @Mock
    private PermissionChecker permissionCheckerMock;
    @Mock
    private ObjectMapper objectMapperMock;
    @Mock
    private EmailService emailService;
    @Mock
    private OppijaTuontiCreatePostValidator oppijaTuontiCreatePostValidatorMock;
    @Mock
    private YksilointiService yksilointiService;

    @Before
    public void setup() {
        OppijaTuontiServiceImpl oppijaTuontiServiceImpl = new OppijaTuontiServiceImpl(
                henkiloModificationServiceMock,
                mapperMock,
                henkiloRepositoryMock,
                tuontiRepositoryMock,
                organisaatioRepositoryMock,
                userDetailsHelperMock,
                permissionCheckerMock,
                objectMapperMock,
                emailService,
                oppijaTuontiCreatePostValidatorMock,
                yksilointiService);

        OppijaTuontiAsyncServiceImpl oppijaTuontiServiceAsyncImpl = new OppijaTuontiAsyncServiceImpl(
                oppijaTuontiServiceImpl);
        oppijaServiceImpl = new OppijaServiceImpl(oppijaTuontiServiceImpl,
                oppijaTuontiServiceAsyncImpl, henkiloModificationServiceMock,
                organisaatioServiceMock, mapperMock, henkiloRepositoryMock,
                tuontiRepositoryMock,
                organisaatioRepositoryMock, henkiloViiteRepositoryMock, userDetailsHelperMock,
                permissionCheckerMock, objectMapperMock);
    }

    @Test
    public void listMastersShouldFilterOrganisaatioOids() {
        Set<String> organisaatiot = Set.of("oid1", "oid3");
        when(permissionCheckerMock.getAllOrganisaatioOids(any(), any(), any(), any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = OppijaTuontiCriteria.builder()
                .organisaatioOids(Stream.of("oid1", "oid2").collect(toSet()))
                .build();
        int page = 1;
        int count = 20;

        oppijaServiceImpl.listMastersBy(input, page, count);

        ArgumentCaptor<OppijaTuontiCriteria> argumentCaptor = ArgumentCaptor.forClass(OppijaTuontiCriteria.class);
        verify(henkiloRepositoryMock).findBy(argumentCaptor.capture(), eq(count), eq(0), any());
        OppijaTuontiCriteria output = argumentCaptor.getValue();
        assertThat(output.getOrganisaatioOids()).containsExactly("oid1");
    }

    @Test
    public void listMastersShouldSetOrganisaatioOidsWhenCriteriaNull() {
        Set<String> organisaatiot = Set.of("oid1", "oid3");
        when(permissionCheckerMock.getAllOrganisaatioOids(any(), any(), any(), any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = new OppijaTuontiCriteria();
        int page = 1;
        int count = 20;

        oppijaServiceImpl.listMastersBy(input, page, count);

        ArgumentCaptor<OppijaTuontiCriteria> argumentCaptor = ArgumentCaptor.forClass(OppijaTuontiCriteria.class);
        verify(henkiloRepositoryMock).findBy(argumentCaptor.capture(), eq(count), eq(0), any());
        OppijaTuontiCriteria output = argumentCaptor.getValue();
        assertThat(output.getOrganisaatioOids()).containsExactlyInAnyOrder("oid1", "oid3");
    }

    @Test
    public void listMastersShouldSetOrganisaatioOidsWhenCriteriaEmpty() {
        Set<String> organisaatiot = Set.of("oid1", "oid3");
        when(permissionCheckerMock.getAllOrganisaatioOids(any(), any(), any(), any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = OppijaTuontiCriteria.builder().organisaatioOids(emptySet()).build();
        int page = 1;
        int count = 20;

        oppijaServiceImpl.listMastersBy(input, page, count);

        ArgumentCaptor<OppijaTuontiCriteria> argumentCaptor = ArgumentCaptor.forClass(OppijaTuontiCriteria.class);
        verify(henkiloRepositoryMock).findBy(argumentCaptor.capture(), eq(count), eq(0), any());
        OppijaTuontiCriteria output = argumentCaptor.getValue();
        assertThat(output.getOrganisaatioOids()).containsExactlyInAnyOrder("oid1", "oid3");
    }

    @Test
    public void listMastersShouldSkipFindByWhenOrganisaatiotEmpty() {
        OppijaTuontiCriteria input = new OppijaTuontiCriteria();
        int page = 1;
        int count = 20;

        Throwable throwable = catchThrowable(() -> oppijaServiceImpl.listMastersBy(input, page, count));

        assertThat(throwable).isInstanceOf(ValidationException.class);
        verifyNoInteractions(henkiloRepositoryMock);
    }

    @Test
    public void listMastersByTest() {
        when(permissionCheckerMock.isSuperUserOrCanReadAll()).thenReturn(true);
        Henkilo henkilo1slave = new Henkilo();
        henkilo1slave.setOidHenkilo("oid1");
        Henkilo henkilo2 = new Henkilo();
        henkilo2.setOidHenkilo("oid2");
        when(henkiloRepositoryMock.findBy(any(OppijaTuontiCriteria.class), anyInt(), anyInt(), any()))
                .thenReturn(asList(henkilo1slave, henkilo2));
        Map<String, Henkilo> masters = new HashMap<>();
        Henkilo henkilo1master = new Henkilo();
        henkilo1master.setOidHenkilo("oid1-master");
        masters.put("oid1", henkilo1master);
        when(henkiloRepositoryMock.findMastersBySlaveOids(any()))
                .thenReturn(masters);
        when(mapperMock.map(any(Henkilo.class), eq(OppijaReadDto.class)))
                .thenAnswer((InvocationOnMock invocation) -> {
                    Henkilo entity = invocation.getArgument(0);
                    OppijaReadDto dto = new OppijaReadDto();
                    dto.setOid(entity.getOidHenkilo());
                    return dto;
                });
        OppijaTuontiCriteria criteria = new OppijaTuontiCriteria();
        int page = 1;
        int count = 20;

        Page<MasterHenkiloDto<OppijaReadDto>> henkilot = oppijaServiceImpl.listMastersBy(criteria, page, count);

        assertThat(henkilot).extracting(MasterHenkiloDto::getOid).containsExactly("oid1", "oid2");
        assertThat(henkilot).extracting(t -> t.getMaster().getOid()).containsExactly("oid1-master", "oid2");
        verify(henkiloRepositoryMock).findBy(eq(criteria), eq(20), eq(0), any());
        verify(henkiloRepositoryMock).findMastersBySlaveOids(eq(Stream.of("oid1", "oid2").collect(toSet())));
    }

}
