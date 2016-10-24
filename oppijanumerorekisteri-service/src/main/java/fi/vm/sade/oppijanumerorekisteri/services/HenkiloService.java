package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloOidHetuNimiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloKoskiDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkilonYhteystiedotViewDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma;

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
    HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(String henkiloOid);
    Optional<YhteystiedotDto> getHenkiloYhteystiedot(String henkiloOid, YhteystietoRyhma ryhma);
}
