package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;

import java.util.Collection;

/**
 * Tietokantakyselyt henkilöiden virallisten hetujen listaamiseen.
 *
 * Huom! Ei palauta yksilöimättömien henkilöiden hetuja.
 */
public interface HetuRepository {

    Collection<String> findAll();

    Collection<String> findByHenkilo(Henkilo henkilo);

    Collection<String> findByHenkiloOid(String oid);

}
