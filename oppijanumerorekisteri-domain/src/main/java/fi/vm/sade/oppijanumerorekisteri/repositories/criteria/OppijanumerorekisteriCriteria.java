package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import com.querydsl.core.types.Predicate;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;

public interface OppijanumerorekisteriCriteria {
    Predicate condition(QHenkilo qHenkilo);
}
