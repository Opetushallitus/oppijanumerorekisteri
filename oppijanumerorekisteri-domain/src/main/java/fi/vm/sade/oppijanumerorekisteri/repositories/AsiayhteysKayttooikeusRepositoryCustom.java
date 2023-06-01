package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysKayttooikeus;

import java.util.Optional;

public interface AsiayhteysKayttooikeusRepositoryCustom {

    Optional<AsiayhteysKayttooikeus> findByHenkiloOid(String oid);

}
