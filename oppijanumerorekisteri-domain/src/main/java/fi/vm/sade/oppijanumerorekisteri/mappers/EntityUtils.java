package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.IdpEntityId;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import org.springframework.util.StringUtils;

import com.google.common.collect.Sets;

import java.time.LocalDate;
import java.time.Month;
import java.util.Collections;
import java.util.Date;

/**
 * For creating test entitys
 */
public class EntityUtils {
    static public Kansalaisuus createKansalaisuus(String kansalaisuuskoodi) {
        return new Kansalaisuus(kansalaisuuskoodi);
    }

    static public Kielisyys createKielisyys(String kielikoodi, String kielityyppi) {
        return new Kielisyys(kielikoodi, kielityyppi);
    }

    static public Henkilo createHenkilo(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi, Date luontiMuokkausSyncedPvm, Date lastVtjSynced, String kasittelija, String yhteystietoArvo) {
        LocalDate syntymaAika = LocalDate.of(1970, Month.OCTOBER, 10);
        return createHenkilo(etunimet, kutsumanimi, sukunimi, hetu, oidHenkilo,
                passivoitu, kielikoodi, kielityyppi,
                kansalaisuuskoodi, luontiMuokkausSyncedPvm, lastVtjSynced,
                kasittelija, yhteystietoArvo, syntymaAika);
    }

    /* NOTE: This function feels a bit pointless. We could just directly call the builder instead of passing 15 parameters to a "utility" function. */
    static public Henkilo createHenkilo(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi, Date luontiMuokkausSyncedPvm, Date lastVtjSynced, String kasittelija, String yhteystietoArvo, LocalDate syntymaAika) {
        Kielisyys aidinkieli = null;
        if (StringUtils.hasLength(kielikoodi)) {
            aidinkieli = new Kielisyys();
            aidinkieli.setKieliTyyppi(kielityyppi);
            aidinkieli.setKieliKoodi(kielikoodi);
        }
        Kansalaisuus kansalaisuus = null;
        if (StringUtils.hasLength(kansalaisuuskoodi)) {
            kansalaisuus = new Kansalaisuus();
            kansalaisuus.setKansalaisuusKoodi(kansalaisuuskoodi);
        }

        return Henkilo.builder()
                .oidHenkilo(oidHenkilo)
                .hetu(hetu)
                .etunimet(etunimet)
                .kutsumanimi(kutsumanimi)
                .sukunimi(sukunimi)
                .aidinkieli(aidinkieli)
                .asiointiKieli(aidinkieli)
                .created(luontiMuokkausSyncedPvm)
                .modified(luontiMuokkausSyncedPvm)
                .vtjsynced(lastVtjSynced)
                .passivoitu(passivoitu)
                .kansalaisuus(Sets.newHashSet(kansalaisuus))
                .yhteystiedotRyhma(Sets.newHashSet(EntityUtils.createYhteystiedotRyhma(yhteystietoArvo)))
                .kasittelijaOid(kasittelija)
                .syntymaaika(syntymaAika)
                .build();
    }

    static public YhteystiedotRyhma createYhteystiedotRyhma(String yhteystietoArvo) {
        YhteystiedotRyhma yhteystiedotRyhma = new YhteystiedotRyhma("yhteystietotyyppi2",
                "alkupera2", false,
                null);
        Yhteystieto yhteystieto = EntityUtils.createYhteystieto(yhteystietoArvo);
        yhteystiedotRyhma.setYhteystieto(Collections.singleton(yhteystieto));
        return yhteystiedotRyhma;
    }

    static public Yhteystieto createYhteystieto(String yhteystietoArvo) {
        return new Yhteystieto(YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, yhteystietoArvo);
    }

    static public Yksilointitieto createYksilointitieto(String etunimet, String kutsumanimi, String sukunimi, String sukupuoli, Henkilo henkilo) {
        return new Yksilointitieto(henkilo, null, etunimet, kutsumanimi, sukunimi, sukupuoli, null, false, null,
                Sets.newHashSet(), Sets.newHashSet());
    }

    static public Identification createIdentification(IdpEntityId idpEntityId, String identifier) {
        return new Identification(idpEntityId, identifier);
    }

}
