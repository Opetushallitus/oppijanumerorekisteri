package fi.vm.sade.oppijanumerorekisteri.mappers;

import DTOs.HenkiloPerustietoDto;
import DTOs.KansalaisuusDto;
import DTOs.KielisyysDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;

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

    static HenkiloPerustietoDto createHenkiloPerustietoDto(String kutsumanimi, String sukunimi, String hetu,
                                                                  String henkiloOid, String kielikoodi, String kielityyppi,
                                                                  String kansalaisuuskoodi) {
        HenkiloPerustietoDto henkiloPerustietoDto = new HenkiloPerustietoDto();
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
