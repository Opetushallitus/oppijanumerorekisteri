package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.Optional;
import java.util.Set;


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

    @Query(value = "select distinct id, oid, author, timestamp, total, inProgress, successful, failures, conflicts, api from tuontikooste where " +
                        "(true = :isSuperUser or org in :userOrgs) and " +
                        "(:filterId is null or id = :filterId) and " +
                        "(:filterAuthor is null or lower(author) like lower('%' || :filterAuthor || '%'))",
      countQuery = "select count(distinct id) from tuontikooste where " +
                        "(true = :isSuperUser or org in :userOrgs) and " +
                        "(:filterId is null or id = :filterId) and " +
                        "(:filterAuthor is null or lower(author) like lower('%' || :filterAuthor || '%'))",
     nativeQuery = true)
    Page<TuontiKooste> getTuontiKooste(
            @Param("isSuperUser") boolean isSuperUser,
            @Param("userOrgs") Set<String> userOrgs,
            @Param("filterId") Long id,
            @Param("filterAuthor") String author,
            Pageable pagination);

    interface ServiceUser {
        String getOid();

        String getName();
    }

    interface TuontiKooste {
        long getId();

        String getOid();

        String getAuthor();

        Date getTimestamp();

        long getTotal();

        long getInProgress();

        long getSuccessful();

        long getFailures();

        long getConflicts();

        String getApi();
    }
}
