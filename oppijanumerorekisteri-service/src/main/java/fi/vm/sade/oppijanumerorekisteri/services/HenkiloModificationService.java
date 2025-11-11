package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

import java.util.List;

public interface HenkiloModificationService {
    HenkiloUpdateDto updateHenkilo(HenkiloUpdateDto henkiloUpdateDto);

    HenkiloForceReadDto forceUpdateHenkilo(HenkiloForceUpdateDto henkiloUpdateDto);

    Henkilo findOrCreateHuoltaja(HuoltajaCreateDto huoltajaCreateDto, Henkilo lapsi);

    Henkilo update(Henkilo henkilo);

    Henkilo disableHenkilo(String oid);

    void removeAccessRights(String oid);

    FindOrCreateWrapper<HenkiloPerustietoDto> findOrCreateHenkiloFromPerustietoDto(HenkiloPerustietoCreateDto henkiloPerustietoDto);

    HenkiloDto createHenkilo(HenkiloCreateDto henkiloDto);

    Henkilo createAndYksiloiHenkilo(HenkiloCreateDto henkiloDto);

    boolean isHenkiloValidForHetuttomanYksilointi(Henkilo henkilo);

    Henkilo createHenkilo(HuoltajaCreateDto huoltajaCreateDto, String kasittelijaOid);

    /**
     * Luo huoltajan. Tämä pitää erikseen liittää lapseen HenkiloHuoltajaSuhde luokan kautta.
     * @param huoltajaCreateDto Huoltajan tiedot hetulla tai ilman
     * @return Luotu huoltaja
     */
    Henkilo createHenkilo(HuoltajaCreateDto huoltajaCreateDto);

    Henkilo createHenkilo(Henkilo henkiloCreate);

    Henkilo createHenkilo(Henkilo henkiloCreate, String kasittelijaOid, boolean validate);

    Henkilo createHenkilo(Henkilo henkiloCreate, String kasittelijaOid, boolean validate, String oidHenkilo);

    List<String> linkHenkilos(String henkiloOid, List<String> similarHenkiloOids);

    void unlinkHenkilo(String oid, String slaveOid);

    List<String> forceLinkHenkilos(String master, List<String> duplicates);
}
