package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KielisyysDto;

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
                                                                  String henkiloOid, String kielikoodi, String kielityyppi,
                                                                  String kansalaisuuskoodi) {
        HenkiloPerustietoDto henkiloPerustietoDto = new HenkiloPerustietoDto();
        henkiloPerustietoDto.setEtunimet(etunimet);
        henkiloPerustietoDto.setHetu(hetu);
        henkiloPerustietoDto.setKutsumanimi(kutsumanimi);
        henkiloPerustietoDto.setSukunimi(sukunimi);
        henkiloPerustietoDto.setOidhenkilo(henkiloOid);
        KielisyysDto aidinkieli = DtoUtils.createKielisyysDto(kielikoodi, kielityyppi);
        henkiloPerustietoDto.setAidinkieli(aidinkieli);
        KansalaisuusDto kansalaisuus = DtoUtils.createKansalaisuusDto(kansalaisuuskoodi);
        henkiloPerustietoDto.setKansalaisuus(Collections.singleton(kansalaisuus));
        return henkiloPerustietoDto;
    }
}
