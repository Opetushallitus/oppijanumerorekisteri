package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiPerustiedotReadDto;
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
    OppijaTuontiPerustiedotReadDto create(OppijaTuontiCreateDto dto);

    /**
     * Tallentaa oppijoiden tuonnin henkilöinä kantaan. Tämä on oppijoiden
     * tuonnin vaihe 2.
     *
     * @param id      oppijoiden tuonnin id
     * @return true jos oppijoiden tuonti on käsitelty kokonaan
     */
    boolean create(long id);

    /**
     * Luo ja palauttaa käyttäjän aktiiviset oppijan tuontiin liittyvät organisaatiot.
     *
     * @return aktiiviset organisaatiot
     */
    Set<Organisaatio> getOrCreateOrganisaatioByKayttaja();


    /*
     * Tarkistaa onko kannassa valmistuneita oppijatuonteja, joissa kaikkia oppijoita ei ole onnistuttu yksilöimään
     * ja joihin ei ole vielä lähetetty sähköposti-ilmoitusta
     *
     */
    void handleOppijaTuontiIlmoitus();
}
