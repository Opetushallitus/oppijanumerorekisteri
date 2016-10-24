package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloOidHetuNimiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloKoskiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;

import java.util.List;
import java.util.Optional;

public interface HenkiloService {
    Boolean getHasHetu(String oid);
    boolean getOidExists(String oid);
    String getOidByHetu(String hetu);
    List<HenkiloKoskiDto> getHenkiloKoskiPerustietoByOids(List<String> oids);
    List<HenkiloPerustietoDto> getHenkiloPerustietoByOids(List<String> oids);
    List<HenkiloOidHetuNimiDto> getHenkiloOidHetuNimiByName(String etunimet, String sukunimi);
    HenkiloOidHetuNimiDto getHenkiloOidHetuNimiByHetu(String hetu);
    HenkiloKoskiDto createHenkiloFromKoskiDto(HenkiloKoskiDto henkiloKoskiDto);

}