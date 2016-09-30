package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.stereotype.Repository;

// Note: can return only Henkilo objects
@Repository
public interface HenkiloRepository extends JpaRepository<Henkilo, Long>, QueryDslPredicateExecutor {

}
