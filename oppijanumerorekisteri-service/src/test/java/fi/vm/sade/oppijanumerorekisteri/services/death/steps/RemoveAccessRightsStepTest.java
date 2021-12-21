package fi.vm.sade.oppijanumerorekisteri.services.death.steps;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

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

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        step.kayttooikeusClient = kayttooikeusClient;
        step.properties = properties;
    }

    @Test
    void clearsContactInformation() {
        given(subject.getOidHenkilo()).willReturn(SUBJECT_OID);
        given(step.properties.getRootUserOid()).willReturn(ROOT_OID);

        step.applyTo(subject);

        verify(subject, times(1)).setCleanupStep(CleanupStep.REMOVE_ACCESS_RIGHTS);
        verify(step.kayttooikeusClient, times(1)).passivoiHenkilo(SUBJECT_OID, ROOT_OID);
    }
}
