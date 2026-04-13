package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TiedoteRepository extends JpaRepository<Tiedote, UUID> {
  List<Tiedote> findByOppijanumeroOrderByCreatedDesc(String oppijanumero);

  Optional<Tiedote> findByIdempotencyKey(String idempotencyKey);

  @Query(
      value =
          """
          SELECT * FROM tiedote
          WHERE tiedotestate_id IN :states
          AND (next_retry IS NULL OR next_retry <= NOW())
          ORDER BY COALESCE(next_retry, created)
          LIMIT 100
          FOR UPDATE SKIP LOCKED
          """,
      nativeQuery = true)
  List<Tiedote> findForProcessingByState(@Param("states") List<String> states);
}
