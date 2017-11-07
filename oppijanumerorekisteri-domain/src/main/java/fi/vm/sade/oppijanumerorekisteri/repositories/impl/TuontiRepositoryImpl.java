package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepositoryCustom;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaContext;

public class TuontiRepositoryImpl implements TuontiRepositoryCustom {

    private final EntityManager entityManager;

    public TuontiRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(Tuonti.class);
    }

    @Override
    public Optional<Tuonti> findForUpdateById(Long id) {
        Tuonti entity = entityManager.find(Tuonti.class, id, LockModeType.PESSIMISTIC_WRITE);
        return Optional.ofNullable(entity);
    }

}
