package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Transactional(propagation = Propagation.MANDATORY)
@Repository
public interface KielisyysRepository extends QuerydslPredicateExecutor, JpaRepository<Kielisyys, Long> {
    Optional<Kielisyys> findByKieliKoodi(String kielikoodi);
}
