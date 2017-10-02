package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.kayttooikeus.dto.OrganisaatioHenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptySet;
import java.util.List;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;
import java.util.stream.Stream;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.Matchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;
import org.mockito.runners.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OppijaServiceImplTest {

    private OppijaServiceImpl oppijaServiceImpl;

    @Mock
    private HenkiloService henkiloServiceMock;
    @Mock
    private OrganisaatioService organisaatioServiceMock;
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

    @Before
    public void setup() {
        oppijaServiceImpl = new OppijaServiceImpl(henkiloServiceMock,
                organisaatioServiceMock, mapperMock, henkiloRepositoryMock,
                henkiloJpaRepositoryMock, tuontiRepositoryMock,
                organisaatioRepositoryMock, userDetailsHelperMock,
                permissionChecker, kayttooikeusClientMock);
    }

    @Test
    public void listOidsShouldFilterOrganisaatioOids() {
        List<OrganisaatioHenkiloDto> organisaatiot = Stream.of("oid1", "oid3")
                .map(oid -> OrganisaatioHenkiloDto.builder().organisaatioOid(oid).build())
                .collect(toList());
        when(kayttooikeusClientMock.getOrganisaatioHenkilot(any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = OppijaTuontiCriteria.builder()
                .organisaatioOids(Stream.of("oid1", "oid2").collect(toSet()))
                .build();

        Iterable<String> oids = oppijaServiceImpl.listOidsBy(input);

        ArgumentCaptor<OppijaTuontiCriteria> argumentCaptor = ArgumentCaptor.forClass(OppijaTuontiCriteria.class);
        verify(henkiloJpaRepositoryMock).findOidsBy(argumentCaptor.capture());
        OppijaTuontiCriteria output = argumentCaptor.getValue();
        assertThat(output.getOrganisaatioOids()).containsExactly("oid1");
    }

    @Test
    public void listOidsShouldSetOrganisaatioOidsWhenCriteriaNull() {
        List<OrganisaatioHenkiloDto> organisaatiot = Stream.of("oid1", "oid3")
                .map(oid -> OrganisaatioHenkiloDto.builder().organisaatioOid(oid).build())
                .collect(toList());
        when(kayttooikeusClientMock.getOrganisaatioHenkilot(any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = new OppijaTuontiCriteria();

        Iterable<String> oids = oppijaServiceImpl.listOidsBy(input);

        ArgumentCaptor<OppijaTuontiCriteria> argumentCaptor = ArgumentCaptor.forClass(OppijaTuontiCriteria.class);
        verify(henkiloJpaRepositoryMock).findOidsBy(argumentCaptor.capture());
        OppijaTuontiCriteria output = argumentCaptor.getValue();
        assertThat(output.getOrganisaatioOids()).containsExactly("oid1", "oid3");
    }

    @Test
    public void listOidsShouldSetOrganisaatioOidsWhenCriteriaEmpty() {
        List<OrganisaatioHenkiloDto> organisaatiot = Stream.of("oid1", "oid3")
                .map(oid -> OrganisaatioHenkiloDto.builder().organisaatioOid(oid).build())
                .collect(toList());
        when(kayttooikeusClientMock.getOrganisaatioHenkilot(any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = OppijaTuontiCriteria.builder().organisaatioOids(emptySet()).build();

        Iterable<String> oids = oppijaServiceImpl.listOidsBy(input);

        ArgumentCaptor<OppijaTuontiCriteria> argumentCaptor = ArgumentCaptor.forClass(OppijaTuontiCriteria.class);
        verify(henkiloJpaRepositoryMock).findOidsBy(argumentCaptor.capture());
        OppijaTuontiCriteria output = argumentCaptor.getValue();
        assertThat(output.getOrganisaatioOids()).containsExactly("oid1", "oid3");
    }

    @Test
    public void listOidsShouldSkipFindByWhenOrganisaatiotEmpty() {
        List<OrganisaatioHenkiloDto> organisaatiot = emptyList();
        when(kayttooikeusClientMock.getOrganisaatioHenkilot(any())).thenReturn(organisaatiot);
        OppijaTuontiCriteria input = new OppijaTuontiCriteria();

        Throwable throwable = catchThrowable(() -> oppijaServiceImpl.listOidsBy(input));

        assertThat(throwable).isInstanceOf(ValidationException.class);
        verifyZeroInteractions(henkiloJpaRepositoryMock);
    }

}
