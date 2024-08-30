package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Transactional(propagation = Propagation.MANDATORY)
@Repository
public interface KansalaisuusRepository extends QuerydslPredicateExecutor<Kansalaisuus>, JpaRepository<Kansalaisuus, Long> {

    Optional<Kansalaisuus> findByKansalaisuusKoodi(String kansalaisuuskoodi);

    /**
     * Hakee kansalaisuuden koodin perusteella tai luo uuden jos ei löydy.
     *
     * @param koodi kansalaisuuden koodi
     * @return kansalaisuus
     */
    default Kansalaisuus findOrCreate(String koodi) {
        return findByKansalaisuusKoodi(koodi).orElseGet(() -> save(new Kansalaisuus(koodi)));
    }
}
