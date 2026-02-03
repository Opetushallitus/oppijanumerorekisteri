package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.MasterHenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaListDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiPerustiedotReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiYhteenvetoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijahakuCriteria;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijahakuResult;
import fi.vm.sade.oppijanumerorekisteri.dto.Page;
import fi.vm.sade.oppijanumerorekisteri.dto.TuontiApi;
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
    OppijaTuontiPerustiedotReadDto create(OppijaTuontiCreateDto dto, TuontiApi api);

    /**
     * Useamman oppijan luonti (vaihe 2). Tarvitaan vain jos oppijoiden tuonnin
     * automaattinen käsittely on keskeytynyt syystä tai toisesta.
     *
     * @param id oppijoiden tuonnin id
     * @return oppijoiden tuonnin perustiedot
     */
    OppijaTuontiPerustiedotReadDto create(Long id, TuontiApi api);

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

    void decorateHenkilosWithLinkedOids(List<OppijaReadDto> henkilos);

    /**
     * Palauttaa oppijoiden tuonnin yhteenvedon.
     *
     * @param criteria hakukriteerit
     * @return yhteenveto
     */
    OppijaTuontiYhteenvetoDto getYhteenveto(OppijaTuontiCriteria criteria);

    Page<OppijaListDto> oppijoidenTuontienVirheet(OppijaTuontiCriteria criteria, int page, int count);

    org.springframework.data.domain.Page<TuontiRepository.TuontiKooste> tuontiKooste(Pageable pagination, Long tuontiId, String author);

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

    org.springframework.data.domain.Page<OppijahakuResult> oppijahaku(OppijahakuCriteria criteria);
}
