package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

// Note: can return only Henkilo objects
@Repository
public interface HenkiloRepository extends JpaRepository<Henkilo, Long>, QueryDslPredicateExecutor {
    @EntityGraph("henkiloWithKansalaisuusAndAidinkieli")
    List<Henkilo> findByOidhenkiloIsIn(List<String> oidhenkilo);
}
