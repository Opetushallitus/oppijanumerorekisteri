package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.AbstractTest;
import fi.vm.sade.oppijanumerorekisteri.repositories.populator.Populator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

public abstract class AbstractRepositoryTest extends AbstractTest {
    @Autowired
    protected TestEntityManager testEntityManager;
    
    @PersistenceContext
    protected EntityManager em;
    
    protected<T> T populate(Populator<T> populator) {
        T entity = populator.apply(em);
        em.flush();
        return entity;
    }
}
