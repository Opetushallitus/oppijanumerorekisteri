package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.TuontiApi;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.services.EmailService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import org.jetbrains.annotations.NotNull;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.util.*;

import static java.util.Set.of;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class OppijaTuontiServiceImplTest {

    private static final String HETU = "hetu";

    @InjectMocks
    private OppijaTuontiServiceImpl oppijaTuontiServiceImpl;

    @Mock
    private TuontiRepository tuontiRepositoryMock;
    @Mock
    private EmailService emailService;
    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private HenkiloRepository henkiloRepository;
    @Mock
    private HenkiloModificationService henkiloModificationService;
    @Mock
    private OrikaConfiguration orikaConfiguration;
    @Mock
    private YksilointiServiceImpl yksilointiService;
    @Mock
    private Henkilo henkilo;
    @Mock
    private TuontiRivi tuontiRivi;

    @Captor
    private ArgumentCaptor<Set<String>> emailCaptor;

    @Test
    public void handleOppijaTuontiIlmoitusTest() {
        Tuonti tuonti1 = Tuonti.builder().ilmoitustarveKasitelty(false).kasiteltavia(10).kasiteltyja(10).sahkoposti("testiposti1@mail.com").build();
        Tuonti tuonti2 = Tuonti.builder().ilmoitustarveKasitelty(false).kasiteltavia(10).kasiteltyja(9).sahkoposti("testiposti2@mail.com").build();
        Tuonti tuonti3 = Tuonti.builder().ilmoitustarveKasitelty(false).kasiteltavia(10).kasiteltyja(10).sahkoposti(null).build();
        Tuonti tuonti4 = Tuonti.builder().ilmoitustarveKasitelty(false).kasiteltavia(100).kasiteltyja(100).sahkoposti("testiposti4@mail.com").build();

        when(tuontiRepositoryMock.findTuontiWithIlmoitustarve()).thenReturn(new ArrayList<>(Arrays.asList(tuonti1, tuonti2, tuonti4)));
        when(tuontiRepositoryMock.findNotKasiteltyTuontiWithoutIlmoitustarve()).thenReturn(Collections.singletonList(tuonti3));

        oppijaTuontiServiceImpl.handleOppijaTuontiIlmoitus();

        assertThat(tuonti1.isIlmoitustarveKasitelty() && tuonti2.isIlmoitustarveKasitelty() && tuonti3.isIlmoitustarveKasitelty() && tuonti4.isIlmoitustarveKasitelty()).isTrue();
        verify(emailService).sendTuontiKasiteltyWithErrorsEmail(emailCaptor.capture());
        assertThat(emailCaptor.getValue()).hasSize(3);
    }

    @Test
    public void detectONRConflictsNone() throws Exception {
        initMocks();
        when(yksilointiService.namesMatch(any(), any(), any(), any())).thenReturn(true);

        oppijaTuontiServiceImpl.create(1L, TuontiApi.OPPIJA);

        verify(tuontiRivi, times(0)).setConflict(any());
    }

    @Test
    public void detectONRConflictsSome() throws Exception {
        initMocks();
        when(yksilointiService.namesMatch(any(), any(), any(), any())).thenReturn(false);

        oppijaTuontiServiceImpl.create(1L, TuontiApi.OPPIJA);

        verify(tuontiRivi, times(1)).setConflict(true);
    }

    @Test
    public void detectONRConflictsNotFound() throws Exception {
        initMocks();
        when(yksilointiService.namesMatch(any(), any(), any(), any())).thenReturn(true);

        oppijaTuontiServiceImpl.create(1L, TuontiApi.OPPIJA);

        verify(tuontiRivi, times(0)).setConflict(any());
    }

    private void initMocks() throws IOException {
        when(henkilo.getHetu()).thenReturn(HETU);
        when(tuontiRepositoryMock.findForUpdateById(any())).thenReturn(tuonti());
        when(tuontiRepositoryMock.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(objectMapper.readValue((byte[]) null, OppijaTuontiCreateDto.class)).thenReturn(tuontiDto());
        when(henkiloRepository.findByHetuIn(any())).thenReturn(List.of(henkilo));
        when(henkiloModificationService.update(any())).thenAnswer(i -> i.getArguments()[0]);
        when(orikaConfiguration.map(any(), any())).thenReturn(tuontiRivi);
    }

    @NotNull
    private Optional<Tuonti> tuonti() {
        return Optional.of(Tuonti.builder().ilmoitustarveKasitelty(false).kasiteltavia(1).kasiteltyja(0)
                .organisaatiot(of(Organisaatio.builder().build()))
                .data(TuontiData.builder().build())
                .henkilot(new HashSet<>())
                .build());
    }

    private OppijaTuontiCreateDto tuontiDto() {
        return OppijaTuontiCreateDto.builder()
                .henkilot(List.of(
                        OppijaTuontiRiviCreateDto.builder()
                                .henkilo(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.builder()
                                        .hetu(HETU)
                                        .build())
                                .build()))
                .build();
    }
}
