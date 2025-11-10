package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

// Note: can return only Henkilo objects
public interface HenkiloRepository extends QuerydslPredicateExecutor<Henkilo>, JpaRepository<Henkilo, Long>, HenkiloJpaRepository {
    String eagerHenkiloSelect = "select distinct h from Henkilo h " +
           "left join fetch h.aidinkieli " +
           "left join fetch h.asiointiKieli " +
           "left join fetch h.kansalaisuus " +
           "left join fetch h.eidasTunnisteet " +
           "left join fetch h.identifications " +
           "left join fetch h.externalIds ";

    @EntityGraph("henkiloDto")
    List<Henkilo> findByOidHenkiloIsIn(Collection<String> oidHenkilo);

    Optional<Henkilo> findByOidHenkilo(String henkiloOid);

    Optional<Henkilo> findByHetu(String hetu);

    List<Henkilo> findByHetuIn(Set<String> hetut);

    @Query(eagerHenkiloSelect + "where (h.hetu in :hetut)")
    List<Henkilo> eagerFindByHetuIn(Set<String> hetut);

    @Query(eagerHenkiloSelect + "where (h.oidHenkilo in :oids)")
    List<Henkilo> eagerFindByOidHenkiloIn(Set<String> oids);
}
