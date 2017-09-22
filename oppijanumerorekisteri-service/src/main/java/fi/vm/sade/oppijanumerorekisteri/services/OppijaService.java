package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijatCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatReadDto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;

/**
 * Oppijoiden käsittelyyn liittyvät toiminnot.
 *
 * @see HenkiloService yleiskäyttöisempi palvelu henkilöiden käsittelyyn
 */
public interface OppijaService {

    /**
     * Oppijoiden luonti eräajona.
     *
     * @param dto oppijoiden tiedot
     * @return oppijoiden tiedot
     */
    OppijatReadDto getOrCreate(OppijatCreateDto dto);

    /**
     * Hakee annetun tuonnin oppijat.
     *
     * @param id erä id
     * @return oppijat
     */
    OppijatReadDto getByTuontiId(Long id);

    /**
     * Palauttaa annettujen hakukriteerien mukaiset henkilöiden OID:t.
     *
     * @param criteria hakukriteerit
     * @return henkilö OID:t
     */
    Iterable<String> listOidsBy(OppijaTuontiCriteria criteria);

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
