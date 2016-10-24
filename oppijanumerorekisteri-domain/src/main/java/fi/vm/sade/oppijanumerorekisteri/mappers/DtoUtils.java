package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;

import java.util.Collections;

class DtoUtils {
    static KielisyysDto createKielisyysDto(String kielikoodi, String kielityyppi) {
        KielisyysDto kielisyysDto = new KielisyysDto();
        kielisyysDto.setKielikoodi(kielikoodi);
        kielisyysDto.setKielityyppi(kielityyppi);
        return kielisyysDto;
    }

    static KansalaisuusDto createKansalaisuusDto(String kansalaisuuskoodi) {
        KansalaisuusDto kansalaisuusDto = new KansalaisuusDto();
        kansalaisuusDto.setKansalaisuuskoodi(kansalaisuuskoodi);
        return kansalaisuusDto;
    }

    static HenkiloPerustietoDto createHenkiloPerustietoDto(String etunimet, String kutsumanimi, String sukunimi, String hetu,
                                                 String henkiloOid, String kielikoodi, String kielityyppi) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KielisyysDto asiointikieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        return new HenkiloPerustietoDto(henkiloOid, hetu, etunimet, kutsumanimi, sukunimi, aidinkieli, asiointikieli);
    }

    static HenkiloKoskiDto createHenkiloKoskiDto(String etunimet, String kutsumanimi, String sukunimi, String hetu,
                                                 String henkiloOid, String kielikoodi, String kielityyppi,
                                                 String kansalaisuuskoodi) {
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        KansalaisuusDto kansalaisuus = DtoUtils.createKansalaisuusDto(kansalaisuuskoodi);
        return new HenkiloKoskiDto(henkiloOid, hetu, etunimet, kutsumanimi, sukunimi, aidinkieli,
                Collections.singleton(kansalaisuus));
    }

    static HenkiloOidHetuNimiDto createHenkiloOidHetuNimiDto(String etunimet, String kutsumanimi, String sukunimi,
                                                             String hetu, String oidHenkilo) {
        HenkiloOidHetuNimiDto henkiloOidHetuNimiDto = new HenkiloOidHetuNimiDto();
        henkiloOidHetuNimiDto.setEtunimet(etunimet);
        henkiloOidHetuNimiDto.setKutsumanimi(kutsumanimi);
        henkiloOidHetuNimiDto.setSukunimi(sukunimi);
        henkiloOidHetuNimiDto.setHetu(hetu);
        henkiloOidHetuNimiDto.setOidhenkilo(oidHenkilo);
        return henkiloOidHetuNimiDto;
    }

    static HenkiloDto createHenkiloDto(String etunimet, String kutsumanimi, String sukunimi, String hetu, String oidHenkilo,
                                       boolean passivoitu, String kielikoodi, String kielityyppi,
                                       String kansalaisuuskoodi) {
        KielisyysDto aidinkieli = new KielisyysDto();
        aidinkieli.setKielityyppi(kielityyppi);
        aidinkieli.setKielikoodi(kielikoodi);

        KansalaisuusDto kansalaisuus = new KansalaisuusDto();
        kansalaisuus.setKansalaisuuskoodi(kansalaisuuskoodi);

        HenkiloDto henkiloDto = new HenkiloDto();
        henkiloDto.setEtunimet(etunimet);
        henkiloDto.setKutsumanimi(kutsumanimi);
        henkiloDto.setSukunimi(sukunimi);
        henkiloDto.setHetu(hetu);
        henkiloDto.setOidhenkilo(oidHenkilo);
        henkiloDto.setPassivoitu(passivoitu);
        henkiloDto.setAidinkieli(aidinkieli);
        henkiloDto.setKielisyys(Collections.singleton(aidinkieli));
        henkiloDto.setKansalaisuus(Collections.singleton(kansalaisuus));
        return henkiloDto;
    }
}
