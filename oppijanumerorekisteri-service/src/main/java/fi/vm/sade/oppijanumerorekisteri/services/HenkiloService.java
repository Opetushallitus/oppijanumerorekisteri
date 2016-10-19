package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;

import java.util.List;

public interface HenkiloService {
    Boolean getHasHetu(String oid);
    boolean getOidExists(String oid);
    String getOidByHetu(String hetu);
    List<HenkiloPerustietoDto> getHenkiloPerustietosByOids(List<String> oids);
}
