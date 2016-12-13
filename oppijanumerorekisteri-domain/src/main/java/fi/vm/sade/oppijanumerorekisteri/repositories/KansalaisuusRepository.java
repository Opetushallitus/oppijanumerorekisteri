package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Transactional(propagation = Propagation.MANDATORY)
@Repository
public interface KansalaisuusRepository extends QueryDslPredicateExecutor, JpaRepository<Kansalaisuus, Long> {
    Optional<Kansalaisuus> findByKansalaisuusKoodi(String kansalaisuuskoodi);
}
