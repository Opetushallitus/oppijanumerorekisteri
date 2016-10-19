package fi.vm.sade.oppijanumerorekisteri.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

public abstract class AbstractRepositoryTest {
    @Autowired
    protected TestEntityManager testEntityManager;
}
