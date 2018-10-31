package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

import java.util.Collection;

public interface YksiloityHetuRepository {

    Collection<String> findAll();

    Collection<String> findByHenkilo(Henkilo henkilo);

    Collection<String> findByHenkiloOid(String oid);

}
