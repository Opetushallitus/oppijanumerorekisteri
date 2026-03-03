package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuomiFiViestitEventRepository extends JpaRepository<SuomiFiViestitEvent, UUID> {
  List<SuomiFiViestitEvent> findByMessageIdOrderByEventTimeAsc(String messageId);
}
