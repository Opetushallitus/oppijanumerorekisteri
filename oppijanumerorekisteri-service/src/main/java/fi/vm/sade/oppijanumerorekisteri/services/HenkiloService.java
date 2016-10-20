package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloOidHetuNimiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;

import java.util.List;
import java.util.Optional;

public interface HenkiloService {
    Boolean getHasHetu(String oid);
    boolean getOidExists(String oid);
    Optional<String> getOidByHetu(String hetu);
    List<HenkiloPerustietoDto> getHenkiloPerustietosByOids(List<String> oids);
    List<HenkiloOidHetuNimiDto> getHenkiloOidHetuNimiByName(String etunimet, String sukunimi);
    Optional<HenkiloOidHetuNimiDto> getHenkiloOidHetuNimiByHetu(String hetu);
}
