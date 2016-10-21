package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Note: can return only Henkilo objects
@Transactional(propagation = Propagation.MANDATORY)
@Repository
public interface HenkiloRepository extends JpaRepository<Henkilo, Long>, QueryDslPredicateExecutor {
    @EntityGraph("henkiloWithKansalaisuusAndAidinkieli")
    List<Henkilo> findByOidhenkiloIsIn(List<String> oidhenkilo);

    @EntityGraph("henkiloWithPerustiedot")
    List<Henkilo> findByOidhenkiloIn(List<String> oidhenkilo);

    @EntityGraph("henkiloWithKansalaisuusAndAidinkieli")
    Henkilo findByHetu(String hetu);

}
