package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysHakemus;
import org.springframework.data.repository.Repository;

/**
 * {@link AsiayhteysHakemus}-rivien hakemiseen. Ei sisällä tallennustoimintoja,
 * koska rivien lisäykset/muokkaukset/poistot on tarkoitus tehdä
 * {@link HenkiloRepository henkilon} kautta.
 */
public interface AsiayhteysHakemusRepository extends Repository<AsiayhteysHakemus, Long>, AsiayhteysHakemusRepositoryCustom {

}
