package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

// Note: can return only Henkilo objects
@Transactional(propagation = Propagation.MANDATORY)
@Repository
public interface HenkiloRepository extends QueryDslPredicateExecutor, JpaRepository<Henkilo, Long> {
    @EntityGraph("henkiloDto")
    List<Henkilo> findByOidHenkiloIsIn(List<String> oidhenkilo);

    Optional<Henkilo> findByOidHenkilo(String henkiloOid);

    Optional<Henkilo> findFirstByHetu(String hetu);

}
