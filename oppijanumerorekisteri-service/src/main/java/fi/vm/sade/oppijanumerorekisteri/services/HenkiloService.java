package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.HenkiloCriteria;
import org.joda.time.DateTime;

import java.time.LocalDate;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public interface HenkiloService {

    Iterable<HenkiloHakuDto> list(HenkiloHakuCriteria criteria, Long offset, Long limit);

    Iterable<HenkiloHakuPerustietoDto> list(HenkiloHakuCriteriaDto criteria, Long offset, Long amount);

    Slice<HenkiloHakuDto> list(HenkiloHakuCriteria criteria, int page, int count);

    Iterable<HenkiloYhteystiedotDto> listWithYhteystiedot(HenkiloHakuCriteria criteria);

    Iterable<HenkiloYhteystiedotDto> listWithYhteystiedotAsAdmin(HenkiloCriteria criteria);

    HenkiloHakuDto getByHakutermi(String hakutermi);

    Iterable<String> listOidByYhteystieto(String arvo);

    Boolean getHasHetu();

    boolean getOidExists(String oid);

    String getOidByHetu(String hetu);

    List<HenkiloPerustietoDto> getHenkiloPerustietoByOids(List<String> oids);

    List<HenkiloDto> getHenkilosByOids(List<String> oids);

    List<HenkiloOidHetuNimiDto> getHenkiloOidHetuNimiByName(String etunimet, String sukunimi);

    HenkiloOidHetuNimiDto getHenkiloOidHetuNimiByHetu(String hetu);

    HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(String henkiloOid);

    Optional<YhteystiedotDto> getHenkiloYhteystiedot(String henkiloOid, String ryhma);

    List<HenkiloHetuAndOidDto> getHetusAndOids(Long syncedBeforeTimestamp, long offset, long limit);

    HenkiloDto getHenkiloByIDPAndIdentifier(String idp, String identifier);

    List<String> listPossibleHenkiloTypesAccessible();

    HenkiloReadDto getMasterByOid(String henkiloOid);

    Map<String, HenkiloDto> getMastersByOids(Set<String> henkiloOids);

    Henkilo getEntityByOid(String henkiloOid);

    HenkiloReadDto getByHetu(String hetu);

    List<HenkiloViiteDto> findHenkiloViittees(HenkiloCriteria criteria);

    List<String> findHenkiloOidsModifiedSince(HenkiloCriteria criteria, DateTime modifiedSince, Integer offset, Integer amount);

    List<HenkiloReadDto> findSlavesByMasterOid(String masterOid);

    Set<String> getHuoltajaSuhdeMuutokset(LocalDate start, LocalDate end);

    String getAsiointikieli(String oidHenkilo);

    String getCurrentUserAsiointikieli();

    /**
     * Hakee henkilön omat tiedot.
     * @see HenkiloService#getOmatTiedot(String)
     * @return kirjautuneen käyttäjän omat tiedot
     */
    HenkiloOmattiedotDto getOmatTiedot();

    /**
     * Hakee henkilön omat tiedot. Asiointikieli käyttää oletuskieltä suomi. Kutsumanimeen yritetään löytää sopiva arvo
     * jos ei asetettu.
     * @param oidHenkilo haettavan henkilön oid
     * @return henkilön omat tiedot
     */
    HenkiloOmattiedotDto getOmatTiedot(String oidHenkilo);

    List<HenkiloPerustietoDto> getHenkiloPerustietoByHetus(List<String> hetus);
}
