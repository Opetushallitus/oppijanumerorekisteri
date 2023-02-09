package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.Sort;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Oppijoiden tuontiin liittyvät toiminnot.
 *
 * @see HenkiloService yleiskäyttöisempi palvelu henkilöiden käsittelyyn
 */
public interface OppijaService {

    /**
     * Yksittäisen oppijan luonti. Lisää automaattisesti oppijan käyttäjän
     * organisaatioihin.
     *
     * @param dto oppijan tiedot
     * @return oid
     */
    String create(OppijaCreateDto dto);

    /**
     * Useamman oppijan luonti (vaihe 1). Käynnistää automaattisesti oppijoiden
     * tuonnin toisen vaiheen toisessa säikeessä.
     *
     * @param dto oppijoiden tiedot
     * @return oppijoiden tuonnin perustiedot
     */
    OppijaTuontiPerustiedotReadDto create(OppijaTuontiCreateDto dto);

    /**
     * Useamman oppijan luonti (vaihe 2). Tarvitaan vain jos oppijoiden tuonnin
     * automaattinen käsittely on keskeytynyt syystä tai toisesta.
     *
     * @param id oppijoiden tuonnin id
     * @return oppijoiden tuonnin perustiedot
     */
    OppijaTuontiPerustiedotReadDto create(Long id);

    /**
     * Palauttaa oppijoiden tuonnin perustiedot ID:lla.
     *
     * @param id oppijoiden tuonnin id
     * @return oppijoiden tuonnin perustiedot
     */
    OppijaTuontiPerustiedotReadDto getTuontiById(Long id);

    /**
     * Palauttaa oppijoiden tuonnin kaikki tiedot ID:lla.
     *
     * @param id oppijoiden tuonnin id
     * @return oppijoiden tuonnin kaikki tiedot
     */
    OppijaTuontiReadDto getOppijatByTuontiId(Long id);

    /**
     * Palauttaa oppijoiden tuonnin yhteenvedon.
     *
     * @param criteria hakukriteerit
     * @return yhteenveto
     */
    OppijaTuontiYhteenvetoDto getYhteenveto(OppijaTuontiCriteria criteria);

    /**
     * Palauttaa annettujen hakukriteerien mukaiset henkilöt.
     *
     * @param criteria hakukriteerit
     * @param page sivunumero
     * @param count sivun koko
     * @return henkilöt
     */
    Page<OppijaListDto> list(OppijaTuontiCriteria criteria, int page, int count, OppijaTuontiSortKey sortKey, Sort.Direction sortDirection);

    org.springframework.data.domain.Page<TuontiRepository.TuontiKooste> tuontiKooste(Pageable pagination);

    List<OppijaTuontiRiviCreateDto> tuontiData(long tuontiId);

    /**
     * Palauttaa annettujen hakukriteerien mukaisen henkilöiden master-tiedot.
     *
     * @param criteria hakukriteerit
     * @param page sivunumero
     * @param count sivun koko
     * @return masterit
     */
    Page<MasterHenkiloDto<OppijaReadDto>> listMastersBy(OppijaTuontiCriteria criteria, int page, int count);

    /**
     * Lisää nykyisen käyttäjän organisaatiot oppijalle. Jos oppija on jo
     * organisaatio ei tehdä mitään.
     *
     * @param henkiloOid oppijan oid
     */
    void addKayttajanOrganisaatiot(String henkiloOid);

    /**
     * Lisää oppijan organisaatioon. Jos oppija on jo organisaatio ei tehdä
     * mitään.
     *
     * @param henkiloOid oppijan oid
     * @param organisaatioOid organisaation oid
     */
    void addOrganisaatio(String henkiloOid, String organisaatioOid);

    /**
     * Poistaa oppijan organisaatiosta. Jos oppija ei ole organisaatiossa ei
     * tehdä mitään.
     *
     * @param henkiloOid oppijan oid
     * @param organisaatioOid organisaation oid
     */
    void deleteOrganisaatio(String henkiloOid, String organisaatioOid);

}
