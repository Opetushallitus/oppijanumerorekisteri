package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.services.impl.KoodistoServiceImpl;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import javax.validation.ValidationException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.mockito.BDDMockito.given;

public class KoodistoServiceTest {
    private KoodistoService koodistoService;

    private KoodistoClient koodistoClientMock;


    @Before
    public void setup() {
        this.koodistoClientMock = Mockito.mock(KoodistoClient.class);
        this.koodistoService = new KoodistoServiceImpl(this.koodistoClientMock);
    }

    @Test // Expect no exception thrown
    public void validateKansalaisuus() throws Exception {
        Set<Kansalaisuus> kansalaisuusSet = new HashSet<>();
        kansalaisuusSet.add(new Kansalaisuus("8", null));
        kansalaisuusSet.add(new Kansalaisuus("12", null));
        List<KoodiType> koodiTypeList = new ArrayList<>();
        for(int i=0; i<10; i++) {
            KoodiType koodiType = new KoodiType();
            koodiType.setKoodiArvo(Integer.toString((i+2)*4));
            koodiTypeList.add(koodiType);
        }
        given(this.koodistoClientMock.getKoodisForKoodisto("maatjavaltiot2", 1, true)).willReturn(koodiTypeList);
        this.koodistoService.postvalidateKansalaisuus(kansalaisuusSet);
    }

    @Test(expected = ValidationException.class)
    public void validateKansalaisuusInvalid() throws Exception {
        Set<Kansalaisuus> kansalaisuusSet = new HashSet<>();
        kansalaisuusSet.add(new Kansalaisuus("8", null));
        kansalaisuusSet.add(new Kansalaisuus("11", null));
        List<KoodiType> koodiTypeList = new ArrayList<>();
        for(int i=0; i<10; i++) {
            KoodiType koodiType = new KoodiType();
            koodiType.setKoodiArvo(Integer.toString((i+2)*4));
            koodiTypeList.add(koodiType);
        }
        given(this.koodistoClientMock.getKoodisForKoodisto("maatjavaltiot2", 1, true)).willReturn(koodiTypeList);
        this.koodistoService.postvalidateKansalaisuus(kansalaisuusSet);
    }

}