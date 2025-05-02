package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.KoodiTypeListBuilder;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;

import static org.mockito.Mockito.doReturn;

public interface KoodistoMock {
    String ALKUPERA_VTJ = "alkupera1";

    default void defaultKoodistoMocks(KoodistoService koodistoService) {
        doReturn(new KoodiTypeListBuilder(Koodisto.SUKUPUOLI).koodi("1").koodi("2").build())
                .when(koodistoService).list(Koodisto.SUKUPUOLI);
        doReturn(new KoodiTypeListBuilder(Koodisto.KIELI).koodi("FR").koodi("FI").koodi("SV").koodi("98").build())
                .when(koodistoService).list(Koodisto.KIELI);
        // https://virkailija.opintopolku.fi/koodisto-service/ui/koodisto/view/yhteystietojenalkupera/1
        doReturn(new KoodiTypeListBuilder(Koodisto.YHTEYSTIETOJEN_ALKUPERA)
                .koodi(ALKUPERA_VTJ)
                .koodi("alkupera2")
                .build())
                .when(koodistoService).list(Koodisto.YHTEYSTIETOJEN_ALKUPERA);
        // https://virkailija.opintopolku.fi/koodisto-service/ui/koodisto/view/yhteystietotyypit/1
        doReturn(new KoodiTypeListBuilder(Koodisto.YHTEYSTIETOTYYPIT)
                .koodi("yhteystietotyyppi4")
                .koodi("yhteystietotyyppi5")
                .koodi("yhteystietotyyppi7")
                .koodi("yhteystietotyyppi8")
                .koodi("yhteystietotyyppi9")
                .koodi("yhteystietotyyppi11")
                .build())
                .when(koodistoService).list(Koodisto.YHTEYSTIETOTYYPIT);
        doReturn(new KoodiTypeListBuilder(Koodisto.SUKUPUOLI).koodi("1").koodi("2").build())
                .when(koodistoService).list(Koodisto.SUKUPUOLI);
        doReturn(new KoodiTypeListBuilder(Koodisto.KIELI).koodi("FR").koodi("FI").koodi("SV").koodi("98").build())
                .when(koodistoService).list(Koodisto.KIELI);
        doReturn(new KoodiTypeListBuilder(Koodisto.KUNTA)
                .koodi("049")
                .koodi("091")
                .koodi("123")
                .koodi("182")
                .koodi("287")
                .koodi("999")
                .build())
                .when(koodistoService).list(Koodisto.KUNTA);
        doReturn(new KoodiTypeListBuilder(Koodisto.MAAT_JA_VALTIOT_2)
                .koodi("246")
                .koodi("250")
                .koodi("123")
                .koodi("246")
                .koodi("456")
                .koodi("729")
                .koodi("736")
                .koodi("998")
                .build())
                .when(koodistoService).list(Koodisto.MAAT_JA_VALTIOT_2);
    }
}
