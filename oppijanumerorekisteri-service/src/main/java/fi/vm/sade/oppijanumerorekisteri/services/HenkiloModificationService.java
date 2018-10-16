package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

import java.util.List;

public interface HenkiloModificationService {
    HenkiloUpdateDto updateHenkilo(HenkiloUpdateDto henkiloUpdateDto);

    HenkiloReadDto forceUpdateHenkilo(HenkiloForceUpdateDto henkiloUpdateDto);

    Henkilo findOrCreateHuoltaja(HuoltajaCreateDto huoltajaCreateDto, Henkilo lapsi);

    Henkilo update(Henkilo henkilo);

    Henkilo disableHenkilo(String oid);

    FindOrCreateWrapper<HenkiloPerustietoDto> findOrCreateHenkiloFromPerustietoDto(HenkiloPerustietoDto henkiloPerustietoDto);

    List<HenkiloPerustietoDto> findOrCreateHenkiloFromPerustietoDto(List<HenkiloPerustietoDto> henkilot);

    HenkiloDto createHenkilo(HenkiloCreateDto henkiloDto);

    /**
     * Luo huoltajan. Tämä pitää erikseen liittää lapseen HenkiloHuoltajaSuhde luokan kautta.
     * @param huoltajaCreateDto Huoltajan tiedot hetulla tai ilman
     * @return Luotu huoltaja
     */
    Henkilo createHenkilo(HuoltajaCreateDto huoltajaCreateDto);

    Henkilo createHenkilo(Henkilo henkiloCreate);

    Henkilo createHenkilo(Henkilo henkiloCreate, String kasittelijaOid, boolean validate);


}
