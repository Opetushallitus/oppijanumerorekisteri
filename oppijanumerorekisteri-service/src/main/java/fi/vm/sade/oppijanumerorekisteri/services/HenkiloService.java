package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.*;

import java.util.List;
import java.util.Optional;

public interface HenkiloService {
    Boolean getHasHetu();

    boolean getOidExists(String oid);

    String getOidByHetu(String hetu);

    List<HenkiloPerustietoDto> getHenkiloPerustietoByOids(List<String> oids);

    List<HenkiloDto> getHenkilosByOids(List<String> oids);

    List<HenkiloOidHetuNimiDto> getHenkiloOidHetuNimiByName(String etunimet, String sukunimi);

    HenkiloOidHetuNimiDto getHenkiloOidHetuNimiByHetu(String hetu);

    HenkiloPerustietoDto createHenkiloFromPerustietoDto(HenkiloPerustietoDto henkiloPerustietoDto);

    HenkiloDto createHenkiloFromHenkiloDto(HenkiloDto henkiloDto);

    HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(String henkiloOid);

    Optional<YhteystiedotDto> getHenkiloYhteystiedot(String henkiloOid, YhteystietoRyhma ryhma);

    List<HenkiloHetuAndOidDto> getHetusAndOids(Long sinceVtjUpdated);

    HenkiloDto getHenkiloByIDPAndIdentifier(String idp, String identifier);

    List<String> listPossibleHenkiloTypesAccessible();
}
