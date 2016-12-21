package fi.vm.sade.oppijanumerorekisteri.mappers;

import com.google.common.collect.Sets;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhmaAlkuperatieto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhmaKuvaus;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import java.time.LocalDate;
import java.time.Month;

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
                                       String kansalaisuuskoodi, Date luontiMuokkausSyncedPvm, Date lastVtjSynced, String kasittelija, String yhteystietoArvo) {
        LocalDate syntymaAika = LocalDate.of(1970, Month.OCTOBER, 10);
        return createHenkilo(etunimet, kutsumanimi, sukunimi, hetu, oidHenkilo,
                passivoitu, henkiloTyyppi, kielikoodi, kielityyppi,
                kansalaisuuskoodi, luontiMuokkausSyncedPvm, lastVtjSynced,
                kasittelija, yhteystietoArvo, syntymaAika);
    }

    static public Henkilo createHenkilo(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, HenkiloTyyppi henkiloTyyppi, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi, Date luontiMuokkausSyncedPvm, Date lastVtjSynced, String kasittelija, String yhteystietoArvo, LocalDate syntymaAika) {
        Kielisyys aidinkieli = new Kielisyys();
        aidinkieli.setKieliTyyppi(kielityyppi);
        aidinkieli.setKieliKoodi(kielikoodi);

        Kansalaisuus kansalaisuus = new Kansalaisuus();
        kansalaisuus.setKansalaisuusKoodi(kansalaisuuskoodi);

        YhteystiedotRyhma yhteystiedotRyhma = EntityUtils.createYhteystiedotRyhma(null, yhteystietoArvo);

        Henkilo henkilo = new Henkilo(oidHenkilo, hetu, henkiloTyyppi, etunimet, kutsumanimi, sukunimi, aidinkieli, aidinkieli,
                luontiMuokkausSyncedPvm, luontiMuokkausSyncedPvm, lastVtjSynced, passivoitu, false, false, false, false, false,
                Sets.newHashSet(aidinkieli), Sets.newHashSet(kansalaisuus), null, kasittelija, "1", syntymaAika,
                null, null, null, null, null, false);
        yhteystiedotRyhma.setHenkilo(henkilo);
        henkilo.setYhteystiedotRyhma(Sets.newHashSet(yhteystiedotRyhma));
        return henkilo;
    }

    static public YhteystiedotRyhma createYhteystiedotRyhma(Henkilo henkilo, String yhteystietoArvo) {
        YhteystiedotRyhma yhteystiedotRyhma = new YhteystiedotRyhma(henkilo, YhteystietoRyhmaKuvaus.TYOOSOITE.getRyhmanKuvaus(),
                YhteystietoRyhmaAlkuperatieto.RYHMAALKUPERA_VIRKAILIJA.getAlkuperatieto(), false,
                null);
        Yhteystieto yhteystieto = EntityUtils.createYhteystieto(null, yhteystietoArvo);
        yhteystiedotRyhma.setYhteystieto(Collections.singleton(yhteystieto));
        yhteystieto.setYhteystiedotRyhma(yhteystiedotRyhma);
        return yhteystiedotRyhma;
    }

    static public Yhteystieto createYhteystieto(YhteystiedotRyhma yhteystiedotRyhma, String yhteystietoArvo) {
        return new Yhteystieto(yhteystiedotRyhma, YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, yhteystietoArvo);
    }
}
