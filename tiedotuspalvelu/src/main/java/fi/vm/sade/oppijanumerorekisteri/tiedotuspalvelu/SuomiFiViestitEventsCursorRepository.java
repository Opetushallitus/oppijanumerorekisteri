package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuomiFiViestitEventsCursorRepository
    extends JpaRepository<SuomiFiViestitEventsCursor, Boolean> {}
