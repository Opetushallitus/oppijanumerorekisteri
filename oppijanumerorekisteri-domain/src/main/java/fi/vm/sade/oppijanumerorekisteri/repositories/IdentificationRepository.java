package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Transactional(propagation = Propagation.MANDATORY)
@Repository
public interface IdentificationRepository extends QueryDslPredicateExecutor, JpaRepository<Identification, Long> {
    Optional<Identification> findByIdpEntityIdAndIdentifier(String idpEntityId, String identifier);
}
