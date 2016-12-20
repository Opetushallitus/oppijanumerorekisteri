package fi.vm.sade.oppijanumerorekisteri.utils;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Date;
import java.util.HashSet;

@Component
public class DtoUtils {
    public static KielisyysDto createKielisyysDto(String kielikoodi, String kielityyppi) {
        KielisyysDto kielisyysDto = new KielisyysDto();
        kielisyysDto.setKieliKoodi(kielikoodi);
        kielisyysDto.setKieliTyyppi(kielityyppi);
        return kielisyysDto;
    }

    public static KansalaisuusDto createKansalaisuusDto(String kansalaisuuskoodi) {
        KansalaisuusDto kansalaisuusDto = new KansalaisuusDto();
        kansalaisuusDto.setKansalaisuusKoodi(kansalaisuuskoodi);
        return kansalaisuusDto;
    }

    public static HenkiloPerustietoDto createHenkiloPerustietoDto(String etunimet, String kutsumanimi, String sukunimi,
                                                                  String hetu, String henkiloOid, String kielikoodi,
                                                                  String kielityyppi, String kansalaisuusKoodi) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KielisyysDto asiointikieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KansalaisuusDto kansalaisuusDto = DtoUtils.createKansalaisuusDto(kansalaisuusKoodi);
        return new HenkiloPerustietoDto(henkiloOid, hetu, etunimet, kutsumanimi, sukunimi, aidinkieli, asiointikieli,
                Collections.singleton(kansalaisuusDto), HenkiloTyyppi.VIRKAILIJA, "1", false);
    }

    public static HenkiloOidHetuNimiDto createHenkiloOidHetuNimiDto(String etunimet, String kutsumanimi, String sukunimi,
                                                             String hetu, String oidHenkilo) {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = new HenkiloOidHetuNimiDto();
        henkiloOidHetuNimiDto.setEtunimet(etunimet);
        henkiloOidHetuNimiDto.setKutsumanimi(kutsumanimi);
        henkiloOidHetuNimiDto.setSukunimi(sukunimi);
        henkiloOidHetuNimiDto.setHetu(hetu);
        henkiloOidHetuNimiDto.setOidHenkilo(oidHenkilo);
        return henkiloOidHetuNimiDto;
    }

    public static HenkiloDto createHenkiloDto(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi, String kasittelija, String yhteystietoArvo) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);

        KansalaisuusDto kansalaisuus = new KansalaisuusDto();
        kansalaisuus.setKansalaisuusKoodi(kansalaisuuskoodi);
        Date syntymaAika = new Date(24364800000L);

        Date createdModified = new Date(29364800000L);
        YhteystiedotRyhmaDto yhteystiedotRyhmaDto = createYhteystiedotRyhmaDto(yhteystietoArvo);

        return new HenkiloDto(oidHenkilo, hetu, passivoitu, HenkiloTyyppi.VIRKAILIJA, etunimet, kutsumanimi, sukunimi,
                 aidinkieli, aidinkieli, Collections.singleton(aidinkieli), Collections.singleton(kansalaisuus), kasittelija,
                syntymaAika, "1", "passinro", "1.2.3.4.5", null, false, false, false, false, false, createdModified,
                createdModified, null, null, Collections.singleton(yhteystiedotRyhmaDto));
    }

    public static HenkiloHetuAndOidDto createHenkiloHetuAndOidDto(String henkiloOid, String hetu, Date vtjsynced) {
        HenkiloHetuAndOidDto henkiloHetuAndOidDto = new HenkiloHetuAndOidDto();
        henkiloHetuAndOidDto.setOidHenkilo(henkiloOid);
        henkiloHetuAndOidDto.setHetu(hetu);
        henkiloHetuAndOidDto.setVtjsynced(vtjsynced);
        return henkiloHetuAndOidDto;
    }

    public static HenkiloUpdateDto createHenkiloUpdateDto(String etunimet, String kutsumanimi, String sukunimi, String hetu,
                                                          String oidHenkilo, String kielikoodi, String kielityyppi,
                                                          String kansalaisuuskoodi, String kasittelija, String yhteystietoArvo) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KielisyysDto asiointikieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KansalaisuusDto kansalaisuus = DtoUtils.createKansalaisuusDto(kansalaisuuskoodi);
        YhteystiedotRyhmaDto yhteystiedotRyhma = DtoUtils.createYhteystiedotRyhmaDto(yhteystietoArvo);

        return new HenkiloUpdateDto(oidHenkilo, etunimet, kutsumanimi, sukunimi, hetu, HenkiloTyyppi.VIRKAILIJA,
                new Date(24364800000L), "1", false, new Date(), kasittelija, asiointikieli, aidinkieli,
                Collections.singleton(aidinkieli), Collections.singleton(kansalaisuus), Collections.singleton(yhteystiedotRyhma));
    }

    public static YhteystiedotRyhmaDto createYhteystiedotRyhmaDto(String yhteystietoArvo) {
        YhteystietoDto yhteystieto = DtoUtils.createYhteystietoDto(yhteystietoArvo);
        return new YhteystiedotRyhmaDto(YhteystietoRyhmaKuvaus.MUU_OSOITE, YhteystietoRyhmaAlkuperatieto.RYHMAALKUPERA_VIRKAILIJA,
                true, Collections.singleton(yhteystieto));
    }

    public static YhteystietoDto createYhteystietoDto(String yhteystietoArvo) {
        return new YhteystietoDto(YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO, yhteystietoArvo);
    }
}
