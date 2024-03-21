package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.repositories.populator.Populator;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

public abstract class AbstractRepositoryTest {
    @PersistenceContext
    protected EntityManager em;
    
    protected<T> T populate(Populator<T> populator) {
        T entity = populator.apply(em);
        em.flush();
        return entity;
    }
}
