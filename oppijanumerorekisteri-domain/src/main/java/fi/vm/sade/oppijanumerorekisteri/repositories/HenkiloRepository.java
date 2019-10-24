package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

// Note: can return only Henkilo objects
public interface HenkiloRepository extends QuerydslPredicateExecutor, JpaRepository<Henkilo, Long>, HenkiloJpaRepository {
    @EntityGraph("henkiloDto")
    List<Henkilo> findByOidHenkiloIsIn(Collection<String> oidHenkilo);

    Optional<Henkilo> findByOidHenkilo(String henkiloOid);

    Optional<Henkilo> findByHetu(String hetu);

    @Query("select h from Henkilo h where :hetu member of h.kaikkiHetut")
    Optional<Henkilo> findByKaikkiHetut(@Param("hetu") String hetu);

    List<Henkilo> findByHetuIn(Set<String> hetut);

}
