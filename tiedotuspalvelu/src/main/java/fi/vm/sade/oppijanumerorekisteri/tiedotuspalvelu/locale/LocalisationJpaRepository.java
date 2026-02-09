package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
interface LocalisationJpaRepository
    extends JpaRepository<Localisation, Localisation.LocalisationId> {}
