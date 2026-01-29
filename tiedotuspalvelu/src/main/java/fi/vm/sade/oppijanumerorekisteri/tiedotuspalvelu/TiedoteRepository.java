package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TiedoteRepository extends JpaRepository<Tiedote, UUID> {
  List<Tiedote> findByOppijanumeroOrderByIdAsc(String oppijanumero);

  @Query(
      value =
          "SELECT * FROM tiedote WHERE processed_at IS NULL AND (next_retry IS NULL OR next_retry <= NOW()) FOR UPDATE SKIP LOCKED",
      nativeQuery = true)
  List<Tiedote> findByProcessedAtIsNull();
}
