package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.impl.JPAQueryFactory;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Transactional
public class HenkiloRepositoryImpl implements HenkiloHibernateRepository {
    @PersistenceContext
    private EntityManager entityManager;

    private JPAQueryFactory getHibernateQueryFactory() {
        return new JPAQueryFactory(this.entityManager);
    }

    @Override
    public String getHetuByOid(String henkiloOid) {
        JPAQueryFactory hibernateQueryFactory = this.getHibernateQueryFactory();
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return hibernateQueryFactory.selectFrom(qHenkilo).select(qHenkilo.hetu)
                .where(qHenkilo.oidHenkilo.eq(henkiloOid))
                .fetchOne();
    }
}
