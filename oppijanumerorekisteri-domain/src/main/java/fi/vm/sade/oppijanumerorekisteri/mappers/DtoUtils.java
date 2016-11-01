package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;

import java.util.Collections;

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

    public static HenkiloPerustietoDto createHenkiloPerustietoDto(String etunimet, String kutsumanimi, String sukunimi, String hetu,
                                                 String henkiloOid, String kielikoodi, String kielityyppi, String kansalaisuusKoodi) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KielisyysDto asiointikieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KansalaisuusDto kansalaisuusDto = DtoUtils.createKansalaisuusDto(kansalaisuusKoodi);
        return new HenkiloPerustietoDto(henkiloOid, hetu, etunimet, kutsumanimi, sukunimi, aidinkieli, asiointikieli,
                Collections.singleton(kansalaisuusDto), HenkiloTyyppi.VIRKAILIJA);
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
                                       String kansalaisuuskoodi) {
        KielisyysDto aidinkieli = new KielisyysDto();
        aidinkieli.setKielityyppi(kielityyppi);
        aidinkieli.setKielikoodi(kielikoodi);

        KansalaisuusDto kansalaisuus = new KansalaisuusDto();
        kansalaisuus.setKansalaisuuskoodi(kansalaisuuskoodi);

        return new HenkiloDto(oidHenkilo, hetu, passivoitu, HenkiloTyyppi.VIRKAILIJA, etunimet, kutsumanimi, sukunimi,
                 aidinkieli, Collections.singleton(aidinkieli), Collections.singleton(kansalaisuus));
    }
}
