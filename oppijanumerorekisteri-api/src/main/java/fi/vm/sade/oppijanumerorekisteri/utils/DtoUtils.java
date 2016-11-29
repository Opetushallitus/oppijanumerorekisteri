package fi.vm.sade.oppijanumerorekisteri.utils;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Date;

@Component
public class DtoUtils {
    public static KielisyysDto createKielisyysDto(String kielikoodi, String kielityyppi) {
        KielisyysDto kielisyysDto = new KielisyysDto();
        kielisyysDto.setKielikoodi(kielikoodi);
        kielisyysDto.setKielityyppi(kielityyppi);
        return kielisyysDto;
    }

    public static KansalaisuusDto createKansalaisuusDto(String kansalaisuuskoodi) {
        KansalaisuusDto kansalaisuusDto = new KansalaisuusDto();
        kansalaisuusDto.setKansalaisuuskoodi(kansalaisuuskoodi);
        return kansalaisuusDto;
    }

    public static HenkiloPerustietoDto createHenkiloPerustietoDto(String etunimet, String kutsumanimi, String sukunimi,
                                                                  String hetu, String henkiloOid, String kielikoodi,
                                                                  String kielityyppi, String kansalaisuusKoodi,
                                                                  String kasittelija) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KielisyysDto asiointikieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KansalaisuusDto kansalaisuusDto = DtoUtils.createKansalaisuusDto(kansalaisuusKoodi);
        return new HenkiloPerustietoDto(henkiloOid, hetu, etunimet, kutsumanimi, sukunimi, aidinkieli, asiointikieli,
                Collections.singleton(kansalaisuusDto), HenkiloTyyppi.VIRKAILIJA, kasittelija, "1");
    }

    public static HenkiloOidHetuNimiDto createHenkiloOidHetuNimiDto(String etunimet, String kutsumanimi, String sukunimi,
                                                             String hetu, String oidHenkilo) {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = new HenkiloOidHetuNimiDto();
        henkiloOidHetuNimiDto.setEtunimet(etunimet);
        henkiloOidHetuNimiDto.setKutsumanimi(kutsumanimi);
        henkiloOidHetuNimiDto.setSukunimi(sukunimi);
        henkiloOidHetuNimiDto.setHetu(hetu);
        henkiloOidHetuNimiDto.setOidhenkilo(oidHenkilo);
        return henkiloOidHetuNimiDto;
    }

    public static HenkiloDto createHenkiloDto(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi, String kasittelija) {
        KielisyysDto aidinkieli = new KielisyysDto();
        aidinkieli.setKielityyppi(kielityyppi);
        aidinkieli.setKielikoodi(kielikoodi);

        KansalaisuusDto kansalaisuus = new KansalaisuusDto();
        kansalaisuus.setKansalaisuuskoodi(kansalaisuuskoodi);
        Date syntymaAika = new Date(24364800000L);

        return new HenkiloDto(oidHenkilo, hetu, passivoitu, HenkiloTyyppi.VIRKAILIJA, etunimet, kutsumanimi, sukunimi,
                 aidinkieli, aidinkieli, Collections.singleton(aidinkieli), Collections.singleton(kansalaisuus), kasittelija,
                syntymaAika, "1");
    }

    public static HenkiloHetuAndOidDto createHenkiloHetuAndOidDto(String henkiloOid, String hetu, Date vtjsynced) {
        HenkiloHetuAndOidDto henkiloHetuAndOidDto = new HenkiloHetuAndOidDto();
        henkiloHetuAndOidDto.setOidhenkilo(henkiloOid);
        henkiloHetuAndOidDto.setHetu(hetu);
        henkiloHetuAndOidDto.setVtjsynced(vtjsynced);
        return henkiloHetuAndOidDto;
    }
}