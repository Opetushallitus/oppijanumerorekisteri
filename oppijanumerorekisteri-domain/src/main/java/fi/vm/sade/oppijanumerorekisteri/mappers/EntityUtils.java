package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;

import java.util.Collections;
import java.util.Date;

public class EntityUtils {
    static public Kansalaisuus createKansalaisuus(String kansalaisuuskoodi) {
        Kansalaisuus kansalaisuus = new Kansalaisuus();
        kansalaisuus.setKansalaisuuskoodi(kansalaisuuskoodi);
        return kansalaisuus;
    }

    static public Kielisyys createKielisyys(String kielikoodi, String kielityyppi) {
        Kielisyys kielisyys = new Kielisyys();
        kielisyys.setKielikoodi(kielikoodi);
        kielisyys.setKielityyppi(kielityyppi);
        return kielisyys;
    }

    static public Henkilo createHenkilo(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, HenkiloTyyppi henkiloTyyppi, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi) {
        Kielisyys aidinkieli = new Kielisyys();
        aidinkieli.setKielityyppi(kielityyppi);
        aidinkieli.setKielikoodi(kielikoodi);

        Kansalaisuus kansalaisuus = new Kansalaisuus();
        kansalaisuus.setKansalaisuuskoodi(kansalaisuuskoodi);

        Henkilo henkilo = new Henkilo();
        henkilo.setEtunimet(etunimet);
        henkilo.setKutsumanimi(kutsumanimi);
        henkilo.setSukunimi(sukunimi);
        henkilo.setHetu(hetu);
        henkilo.setOidhenkilo(oidHenkilo);
        henkilo.setPassivoitu(passivoitu);
        henkilo.setHenkilotyyppi(henkiloTyyppi);
        henkilo.setLuontiPvm(new Date());
        henkilo.setMuokkausPvm(new Date());
        henkilo.setAidinkieli(aidinkieli);
        henkilo.setKielisyys(Collections.singleton(aidinkieli));
        henkilo.setKansalaisuus(Collections.singleton(kansalaisuus));
        return henkilo;
    }
}
