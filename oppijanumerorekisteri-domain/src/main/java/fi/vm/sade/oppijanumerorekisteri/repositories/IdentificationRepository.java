package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import org.springframework.data.repository.Repository;

/**
 * {@link Identification}-rivien hakemiseen. Ei sisällä tallennustoimintoja,
 * koska rivien lisäykset/muokkaukset/poistot on tarkoitus tehdä
 * {@link HenkiloRepository henkilon} kautta.
 */
public interface IdentificationRepository extends Repository<Identification, Long>, IdentificationRepositoryCustom {

}
