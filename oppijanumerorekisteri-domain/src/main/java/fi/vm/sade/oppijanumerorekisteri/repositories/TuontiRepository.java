package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TuontiRepository extends CrudRepository<Tuonti, Long>, TuontiRepositoryCustom {

    Optional<Tuonti> findById(Long id);

    @Query(value = "select oid, name from ( " +
            "select " +
            "   t.kasittelija_oid as oid, " +
            "   h2.sukunimi || ' ' || h2.etunimet as name, " +
            "   t.aikaleima " +
            "from henkilo h " +
            "   join tuonti_rivi tr on tr.henkilo_id = h.id " +
            "   join tuonti t on t.id = tr.tuonti_id " +
            "   join henkilo h2 on h2.oidhenkilo = t.kasittelija_oid " +
            "where " +
            "   h.oidhenkilo = :oid " +
            "order by t.aikaleima asc limit 1) serviceuser",
            nativeQuery = true)
    Optional<ServiceUser> getServiceUserForImportedPerson(@Param("oid") String oid);

    interface ServiceUser {
        String getOid();

        String getName();
    }
}
