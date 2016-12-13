package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import org.springframework.validation.BindException;

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

    HenkiloUpdateDto updateHenkiloFromHenkiloUpdateDto(HenkiloUpdateDto henkiloUpdateDto) throws BindException;

    HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(String henkiloOid);

    Optional<YhteystiedotDto> getHenkiloYhteystiedot(String henkiloOid, YhteystietoRyhmaKuvaus ryhma);

    List<HenkiloHetuAndOidDto> getHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit);

    HenkiloDto getHenkiloByIDPAndIdentifier(String idp, String identifier);

    List<String> listPossibleHenkiloTypesAccessible();

    List<HenkiloViiteDto> findHenkiloViittees(HenkiloCriteria query);
}
