package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysHakemus;

import java.util.List;

public interface AsiayhteysHakemusRepositoryCustom {

    List<AsiayhteysHakemus> findByHenkiloOid(String oid);

}
