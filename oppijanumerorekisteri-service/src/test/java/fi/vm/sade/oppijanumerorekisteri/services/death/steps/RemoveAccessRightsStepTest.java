package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

class RemoveAccessRightsStepTest {

    private static final String SUBJECT_OID = "subject";
    private static final String ROOT_OID = "root";

    final RemoveAccessRightsStep step = new RemoveAccessRightsStep();

    @Mock
    Henkilo subject;

    @Mock
    KayttooikeusClient kayttooikeusClient;

    @Mock
    OppijanumerorekisteriProperties properties;

    @Mock
    HenkiloRepository henkiloRepository;

    private AutoCloseable mocks;

    @BeforeEach
    void setUp() {
        mocks = MockitoAnnotations.openMocks(this);
        step.kayttooikeusClient = kayttooikeusClient;
        step.properties = properties;
        step.henkiloRepository = henkiloRepository;
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(subject));
    }

    @AfterEach
    void tearDown() throws Exception {
        mocks.close();
    }

    @Test
    void clearsContactInformation() {
        given(subject.getOidHenkilo()).willReturn(SUBJECT_OID);
        given(step.properties.getRootUserOid()).willReturn(ROOT_OID);

        step.applyTo(subject.getOidHenkilo());

        verify(subject, times(1)).setCleanupStep(CleanupStep.REMOVE_ACCESS_RIGHTS);
        verify(step.kayttooikeusClient, times(1)).passivoiHenkilo(SUBJECT_OID, ROOT_OID);
    }
}
