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
      value = "SELECT * FROM tiedote WHERE suomi_fi_viesti_sent = false FOR UPDATE SKIP LOCKED",
      nativeQuery = true)
  List<Tiedote> findBySuomiFiViestiNotSent();
}
