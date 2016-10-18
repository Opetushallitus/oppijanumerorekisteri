package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;

import java.util.Collections;

class EntityUtils {
    static Kansalaisuus createKansalaisuus(String kansalaisuuskoodi) {
        Kansalaisuus kansalaisuus = new Kansalaisuus();
        kansalaisuus.setKansalaisuuskoodi(kansalaisuuskoodi);
        return kansalaisuus;
    }

    static Kielisyys createKielisyys(String kielikoodi, String kielityyppi) {
        Kielisyys kielisyys = new Kielisyys();
        kielisyys.setKielikoodi(kielikoodi);
        kielisyys.setKielityyppi(kielityyppi);
        return kielisyys;
    }

    static Henkilo createPerustietoHenkilo(String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                                      String kielikoodi, String kielityyppi, String kansalaisuuskoodi) {
        Henkilo henkilo = new Henkilo();
        henkilo.setHetu(hetu);
        henkilo.setPassivoitu(false);
        henkilo.setKutsumanimi(kutsumanimi);
        henkilo.setSukunimi(sukunimi);
        henkilo.setOidhenkilo(oidHenkilo);
        Kielisyys aidinkieli = EntityUtils.createKielisyys(kielikoodi, kielityyppi);
        henkilo.setAidinkieli(aidinkieli);
        Kansalaisuus kansalaisuus = EntityUtils.createKansalaisuus(kansalaisuuskoodi);
        henkilo.setKansalaisuus(Collections.singleton(kansalaisuus));
        return henkilo;
    }
}
