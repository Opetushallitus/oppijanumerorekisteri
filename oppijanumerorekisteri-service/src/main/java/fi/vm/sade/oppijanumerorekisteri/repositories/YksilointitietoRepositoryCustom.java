package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.Yksilointitieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YksilointitietoCriteria;

public interface YksilointitietoRepositoryCustom {

    Iterable<Yksilointitieto> findBy(YksilointitietoCriteria criteria, int limit, int offset);

    long countBy(YksilointitietoCriteria criteria);

}
