package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TiedoteRepository extends JpaRepository<Tiedote, UUID> {
  List<Tiedote> findByOppijanumeroOrderByIdAsc(String oppijanumero);
}
