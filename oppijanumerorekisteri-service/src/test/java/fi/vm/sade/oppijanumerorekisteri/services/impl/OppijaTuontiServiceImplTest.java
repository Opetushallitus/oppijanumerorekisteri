package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class OppijaTuontiServiceImplTest {

    @InjectMocks
    private OppijaTuontiServiceImpl oppijaTuontiServiceImpl;

    @Mock
    private TuontiRepository tuontiRepositoryMock;
    @Mock
    private EmailService emailService;

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
        ArgumentCaptor<Set> argumentCaptor = ArgumentCaptor.forClass(Set.class);
        verify(emailService).sendTuontiKasiteltyWithErrorsEmail(argumentCaptor.capture());
        Set output = argumentCaptor.getValue();
        assertThat(output.size()).isEqualTo(3);

    }


}
