package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import fi.vm.sade.oppijanumerorekisteri.models.QYksilointitieto;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointitieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointitietoRepositoryCustom;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YksilointitietoCriteria;
import javax.persistence.EntityManager;
import org.springframework.data.jpa.repository.JpaContext;

public class YksilointitietoRepositoryImpl implements YksilointitietoRepositoryCustom {

    private final EntityManager entityManager;

    public YksilointitietoRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(Yksilointitieto.class);
    }

    @Override
    public Iterable<Yksilointitieto> findBy(YksilointitietoCriteria criteria, int limit, int offset) {
        QYksilointitieto qYksilointitieto = QYksilointitieto.yksilointitieto;
        return criteria.getQuery(entityManager, qYksilointitieto)
                .orderBy(qYksilointitieto.id.asc())
                .limit(limit).offset(offset)
                .select(qYksilointitieto).fetch();
    }

    @Override
    public long countBy(YksilointitietoCriteria criteria) {
        QYksilointitieto qYksilointitieto = QYksilointitieto.yksilointitieto;
        return criteria.getQuery(entityManager, qYksilointitieto).fetchCount();
    }

}
