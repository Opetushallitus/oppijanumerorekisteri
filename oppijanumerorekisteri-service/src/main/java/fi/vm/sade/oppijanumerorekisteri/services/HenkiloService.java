package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
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

    HenkiloPerustietoDto findOrCreateHenkiloFromPerustietoDto(HenkiloPerustietoDto henkiloPerustietoDto);

    HenkiloDto createHenkiloFromHenkiloDto(HenkiloDto henkiloDto);

    HenkiloUpdateDto updateHenkiloFromHenkiloUpdateDto(HenkiloUpdateDto henkiloUpdateDto) throws BindException;

    HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(String henkiloOid);

    Optional<YhteystiedotDto> getHenkiloYhteystiedot(String henkiloOid, YhteystietoRyhmaKuvaus ryhma);

    List<HenkiloHetuAndOidDto> getHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit);

    HenkiloDto getHenkiloByIDPAndIdentifier(String idp, String identifier);

    List<String> listPossibleHenkiloTypesAccessible();

    HenkiloReadDto getMasterByOid(String henkiloOid);

    HenkiloReadDto getByHetu(String hetu);
<<<<<<< b315e5a979a8f85d276a6f9cbeab64fabec1eae8
    
    List<HenkiloViiteDto> findHenkiloViittees(HenkiloCriteria query);
=======

    Henkilo createHenkilo(Henkilo henkiloCreate);
>>>>>>> Change createHenkilo(PerustietoDto) to findOrCreate(PerustietoDto). Add tests.
}
