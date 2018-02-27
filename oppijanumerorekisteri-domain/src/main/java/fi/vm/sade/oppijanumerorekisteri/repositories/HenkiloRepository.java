package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import java.util.Collection;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

// Note: can return only Henkilo objects
@Transactional(propagation = Propagation.MANDATORY)
@Repository
public interface HenkiloRepository extends QueryDslPredicateExecutor, JpaRepository<Henkilo, Long>, HenkiloJpaRepository {
    @EntityGraph("henkiloDto")
    List<Henkilo> findByOidHenkiloIsIn(Collection<String> oidHenkilo);

    Optional<Henkilo> findByOidHenkilo(String henkiloOid);

    Optional<Henkilo> findByHetu(String hetu);

    List<Henkilo> findByHetuIn(Set<String> hetut);

    /**
     * Palauttaa kaikki sellaiset henkilöt, jotka eivät vielä olleet rekisterissä. Rajoitettu 5000 kerralla.
     * @return halutut henkilöt
     */
    List<Henkilo> findTop5000ByHetuIsNotNullAndPassivoituIsFalseAndVtjRegisterIsFalseAndYksiloityVTJIsTrue();

}
