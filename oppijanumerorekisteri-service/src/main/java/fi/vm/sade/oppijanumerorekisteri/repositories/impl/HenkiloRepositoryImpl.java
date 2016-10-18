package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.impl.JPAQueryFactory;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Transactional(propagation = Propagation.MANDATORY)
public class HenkiloRepositoryImpl implements HenkiloHibernateRepository {
    @PersistenceContext
    private EntityManager entityManager;

    private JPAQueryFactory getJpaQueryFactory() {
        return new JPAQueryFactory(this.entityManager);
    }

    @Override
    public String getHetuByOid(String henkiloOid) {
        JPAQueryFactory jpaQueryFactory = this.getJpaQueryFactory();
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return jpaQueryFactory.selectFrom(qHenkilo).select(qHenkilo.hetu)
                .where(qHenkilo.oidhenkilo.eq(henkiloOid))
                .fetchOne();
    }

    @Override
    public String getOidByHetu(String hetu) {
        JPAQueryFactory jpaQueryFactory = this.getJpaQueryFactory();
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return jpaQueryFactory.selectFrom(qHenkilo).select(qHenkilo.oidhenkilo)
                .where(qHenkilo.hetu.eq(hetu))
                .fetchOne();
    }
}
