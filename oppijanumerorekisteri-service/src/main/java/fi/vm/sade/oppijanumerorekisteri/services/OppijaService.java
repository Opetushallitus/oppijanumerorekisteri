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

}
