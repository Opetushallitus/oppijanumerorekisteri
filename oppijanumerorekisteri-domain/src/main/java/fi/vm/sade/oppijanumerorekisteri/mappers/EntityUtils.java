package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;

import java.util.Collections;
import java.util.Date;

public class EntityUtils {
    static public Kansalaisuus createKansalaisuus(String kansalaisuuskoodi) {
        return new Kansalaisuus(kansalaisuuskoodi, null);
    }

    static public Kielisyys createKielisyys(String kielikoodi, String kielityyppi) {
        return new Kielisyys(kielikoodi, kielityyppi, null);
    }

    static public Henkilo createHenkilo(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, HenkiloTyyppi henkiloTyyppi, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi, Date luontiMuokkausSyncedPvm, Date lastVtjSynced, String kasittelija) {
        Kielisyys aidinkieli = new Kielisyys();
        aidinkieli.setKielityyppi(kielityyppi);
        aidinkieli.setKielikoodi(kielikoodi);

        Kansalaisuus kansalaisuus = new Kansalaisuus();
        kansalaisuus.setKansalaisuuskoodi(kansalaisuuskoodi);

        Date syntymaAika = new Date(24364800000L); // 10.10.1970

        return new Henkilo(oidHenkilo, hetu, henkiloTyyppi, etunimet, kutsumanimi, sukunimi, aidinkieli, aidinkieli,
        luontiMuokkausSyncedPvm, luontiMuokkausSyncedPvm, lastVtjSynced, passivoitu, false, false, false, false, false,
                Collections.singleton(aidinkieli), Collections.singleton(kansalaisuus), null, kasittelija, "1", syntymaAika,
                null, null, null, null, null);
    }
}
