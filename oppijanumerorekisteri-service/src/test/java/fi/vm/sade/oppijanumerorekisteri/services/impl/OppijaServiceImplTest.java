package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaMuutosDto;
import fi.vm.sade.oppijanumerorekisteri.dto.MasterHenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.Page;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import static java.util.Arrays.asList;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import static java.util.Collections.emptySet;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import static java.util.stream.Collectors.toSet;
import java.util.stream.Stream;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OppijaServiceImplTest {

    private OppijaServiceImpl oppijaServiceImpl;

    @Mock
    private HenkiloService henkiloServiceMock;
    @Mock
    private OrganisaatioService organisaatioServiceMock;
    @Mock
    private YksilointiService yksilointiServiceMock;
    @Mock
    private OrikaConfiguration mapperMock;
    @Mock
    private HenkiloRepository henkiloRepositoryMock;
    @Mock
    private HenkiloJpaRepository henkiloJpaRepositoryMock;
    @Mock
    private TuontiRepository tuontiRepositoryMock;
    @Mock
    private OrganisaatioRepository organisaatioRepositoryMock;
    @Mock
    private UserDetailsHelper userDetailsHelperMock;
    @Mock
    private PermissionChecker permissionChecker;
    @Mock
    private KayttooikeusClient kayttooikeusClientMock;
    @Mock
    private ObjectMapper objectMapperMock;

    @Before
    public void setup() {
        OppijaTuontiServiceImpl oppijaTuontiServiceImpl = new OppijaTuontiServiceImpl(henkiloServiceMock, mapperMock,
                henkiloRepositoryMock, henkiloJpaRepositoryMock,
                tuontiRepositoryMock, organisaatioRepositoryMock,
                kayttooikeusClientMock, userDetailsHelperMock,
                objectMapperMock);
        OppijaTuontiAsyncServiceImpl oppijaTuontiServiceAsyncImpl = new OppijaTuontiAsyncServiceImpl(
                oppijaTuontiServiceImpl);
        oppijaServiceImpl = new OppijaServiceImpl(oppijaTuontiServiceImpl,
                oppijaTuontiServiceAsyncImpl, henkiloServiceMock,
                organisaatioServiceMock, yksilointiServiceMock, mapperMock,
                henkiloRepositoryMock, henkiloJpaRepositoryMock,
                tuontiRepositoryMock, organisaatioRepositoryMock,
                userDetailsHelperMock, permissionChecker,
                kayttooikeusClientMock);
    }

    @Test
    public void listMastersShouldFilterOrganisaatioOids() {
        Set<String> organisaatiot = Stream.of("oid1", "oid3").collect(toSet());
        when(kayttooikeusClientMock.getAktiivisetOrganisaatioHenkilot(any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = OppijaTuontiCriteria.builder()
                .organisaatioOids(Stream.of("oid1", "oid2").collect(toSet()))
                .build();
        int page = 1;
        int count = 20;

        Page<MasterHenkiloDto<OppijaMuutosDto>> henkilot = oppijaServiceImpl.listMastersBy(input, page, count);

        ArgumentCaptor<OppijaTuontiCriteria> argumentCaptor = ArgumentCaptor.forClass(OppijaTuontiCriteria.class);
        verify(henkiloJpaRepositoryMock).findBy(argumentCaptor.capture(), eq(count), eq(0), any());
        OppijaTuontiCriteria output = argumentCaptor.getValue();
        assertThat(output.getOrganisaatioOids()).containsExactly("oid1");
    }

    @Test
    public void listMastersShouldSetOrganisaatioOidsWhenCriteriaNull() {
        Set<String> organisaatiot = Stream.of("oid1", "oid3").collect(toSet());
        when(kayttooikeusClientMock.getAktiivisetOrganisaatioHenkilot(any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = new OppijaTuontiCriteria();
        int page = 1;
        int count = 20;

        Page<MasterHenkiloDto<OppijaMuutosDto>> henkilot = oppijaServiceImpl.listMastersBy(input, page, count);

        ArgumentCaptor<OppijaTuontiCriteria> argumentCaptor = ArgumentCaptor.forClass(OppijaTuontiCriteria.class);
        verify(henkiloJpaRepositoryMock).findBy(argumentCaptor.capture(), eq(count), eq(0), any());
        OppijaTuontiCriteria output = argumentCaptor.getValue();
        assertThat(output.getOrganisaatioOids()).containsExactly("oid1", "oid3");
    }

    @Test
    public void listMastersShouldSetOrganisaatioOidsWhenCriteriaEmpty() {
        Set<String> organisaatiot = Stream.of("oid1", "oid3").collect(toSet());
        when(kayttooikeusClientMock.getAktiivisetOrganisaatioHenkilot(any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = OppijaTuontiCriteria.builder().organisaatioOids(emptySet()).build();
        int page = 1;
        int count = 20;

        Page<MasterHenkiloDto<OppijaMuutosDto>> henkilot = oppijaServiceImpl.listMastersBy(input, page, count);

        ArgumentCaptor<OppijaTuontiCriteria> argumentCaptor = ArgumentCaptor.forClass(OppijaTuontiCriteria.class);
        verify(henkiloJpaRepositoryMock).findBy(argumentCaptor.capture(), eq(count), eq(0), any());
        OppijaTuontiCriteria output = argumentCaptor.getValue();
        assertThat(output.getOrganisaatioOids()).containsExactly("oid1", "oid3");
    }

    @Test
    public void listMastersShouldSkipFindByWhenOrganisaatiotEmpty() {
        Set<String> organisaatiot = emptySet();
        when(kayttooikeusClientMock.getAktiivisetOrganisaatioHenkilot(any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = new OppijaTuontiCriteria();
        int page = 1;
        int count = 20;

        Throwable throwable = catchThrowable(() -> oppijaServiceImpl.listMastersBy(input, page, count));

        assertThat(throwable).isInstanceOf(ValidationException.class);
        verifyZeroInteractions(henkiloJpaRepositoryMock);
    }

    @Test
    public void listMastersByTest() {
        when(permissionChecker.isSuperUser()).thenReturn(true);
        Henkilo henkilo1slave = new Henkilo();
        henkilo1slave.setOidHenkilo("oid1");
        Henkilo henkilo2 = new Henkilo();
        henkilo2.setOidHenkilo("oid2");
        when(henkiloJpaRepositoryMock.findBy(any(OppijaTuontiCriteria.class), anyInt(), anyInt(), any()))
                .thenReturn(asList(henkilo1slave, henkilo2));
        Map<String, Henkilo> masters = new HashMap<>();
        Henkilo henkilo1master = new Henkilo();
        henkilo1master.setOidHenkilo("oid1-master");
        masters.put("oid1", henkilo1master);
        when(henkiloJpaRepositoryMock.findMastersBySlaveOids(any()))
                .thenReturn(masters);
        when(mapperMock.map(any(Henkilo.class), eq(OppijaMuutosDto.class)))
                .thenAnswer((InvocationOnMock invocation) -> {
                    Henkilo entity = invocation.getArgument(0);
                    OppijaMuutosDto dto = new OppijaMuutosDto();
                    dto.setOid(entity.getOidHenkilo());
                    return dto;
        });
        OppijaTuontiCriteria criteria = new OppijaTuontiCriteria();
        int page = 1;
        int count = 20;

        Page<MasterHenkiloDto<OppijaMuutosDto>> henkilot = oppijaServiceImpl.listMastersBy(criteria, page, count);

        assertThat(henkilot).extracting(MasterHenkiloDto::getOid).containsExactly("oid1", "oid2");
        assertThat(henkilot).extracting(t -> t.getMaster().getOid()).containsExactly("oid1-master", "oid2");
        verify(henkiloJpaRepositoryMock).findBy(eq(criteria), eq(20), eq(0), any());
        verify(henkiloJpaRepositoryMock).findMastersBySlaveOids(eq(Stream.of("oid1", "oid2").collect(toSet())));
    }

}
