package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuomiFiViestitEventRepository extends JpaRepository<SuomiFiViestitEvent, UUID> {}
