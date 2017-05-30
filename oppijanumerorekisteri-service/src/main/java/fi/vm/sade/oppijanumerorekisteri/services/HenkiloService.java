package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.oppijanumerorekisteri.dto.Slice;
import fi.vm.sade.oppijanumerorekisteri.dto.FindOrCreateWrapper;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import org.joda.time.DateTime;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface HenkiloService {

    Iterable<HenkiloHakuDto> list(HenkiloHakuCriteria criteria);

    Slice<HenkiloHakuDto> list(HenkiloHakuCriteria criteria, int page, int count);

    Iterable<HenkiloYhteystiedotDto> listWithYhteystiedot(HenkiloHakuCriteria criteria);

    HenkiloHakuDto getByHakutermi(String hakutermi, ExternalPermissionService externalPermissionService);

    Boolean getHasHetu();

    boolean getOidExists(String oid);

    Henkilo disableHenkilo(String oid) throws IOException;

    String getOidByHetu(String hetu);

    List<HenkiloPerustietoDto> getHenkiloPerustietoByOids(List<String> oids);

    List<HenkiloDto> getHenkilosByOids(List<String> oids);

    List<HenkiloOidHetuNimiDto> getHenkiloOidHetuNimiByName(String etunimet, String sukunimi);

    HenkiloOidHetuNimiDto getHenkiloOidHetuNimiByHetu(String hetu);

    FindOrCreateWrapper<HenkiloPerustietoDto> findOrCreateHenkiloFromPerustietoDto(HenkiloPerustietoDto henkiloPerustietoDto);

    List<HenkiloPerustietoDto> findOrCreateHenkiloFromPerustietoDto(List<HenkiloPerustietoDto> henkilot);

    HenkiloDto createHenkilo(HenkiloCreateDto henkiloDto);

    HenkiloUpdateDto updateHenkilo(HenkiloUpdateDto henkiloUpdateDto);

    HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(String henkiloOid);

    Optional<YhteystiedotDto> getHenkiloYhteystiedot(String henkiloOid, String ryhma);

    List<HenkiloHetuAndOidDto> getHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit);

    HenkiloDto getHenkiloByIDPAndIdentifier(String idp, String identifier);

    List<String> listPossibleHenkiloTypesAccessible();

    HenkiloReadDto getMasterByOid(String henkiloOid);

    HenkiloReadDto getByHetu(String hetu);

    List<HenkiloViiteDto> findHenkiloViittees(HenkiloCriteria criteria);

    List<String> findHenkiloOidsModifiedSince(HenkiloCriteria criteria, DateTime modifiedSince, Integer offset, Integer amount);

    Henkilo createHenkilo(Henkilo henkiloCreate);
}
