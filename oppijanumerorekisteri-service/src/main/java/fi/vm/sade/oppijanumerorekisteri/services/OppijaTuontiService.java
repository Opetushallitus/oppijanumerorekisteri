package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijatCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.TuontiReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import java.util.Set;

/**
 * Palvelu oppijoiden tuontiin. Oppijoiden tuonti tehdään kahdessa vaiheessa: 1)
 * tiedot tallennetaan käsittelemättömänä kantaan 2) käsittelemätön tieto
 * tallennetaan henkilöiksi kantaan.
 *
 * @see OppijaTuontiAsyncService
 */
public interface OppijaTuontiService {

    /**
     * Tallentaa oppijoiden tiedot käsittelemättömänä kantaan. Tämä on
     * oppijoiden tuonnin vaihe 1.
     *
     * @param dto oppijoiden tiedot
     * @return tuonnin tiedot
     */
    TuontiReadDto create(OppijatCreateDto dto);

    /**
     * Tallentaa oppijoiden tuonnin henkilöinä kantaan. Tämä on oppijoiden
     * tuonnin vaihe 2.
     *
     * @param id oppijoiden tuonnin id
     * @param eräkoko kuinka monta riviä käsitellään
     * @return true jos oppijoiden tuonti on käsitelty kokonaan
     *
     */
    boolean create(long id, int eräkoko);

    /**
     * Luo ja palauttaa henkilön aktiiviset organisaatiot.
     *
     * @param henkiloOid henkilö oid
     * @return aktiiviset organisaatiot
     */
    Set<Organisaatio> getOrCreateOrganisaatioByHenkilo(String henkiloOid);

}
