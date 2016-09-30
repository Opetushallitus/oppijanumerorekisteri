package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.hibernate.HibernateQueryFactory;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public class HenkiloRepositoryImpl implements HenkiloHibernateRepository {
    private SessionFactory sessionFactory;

    @Autowired
    public HenkiloRepositoryImpl(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    private HibernateQueryFactory getHibernateQueryFactory() {
        return new HibernateQueryFactory(this.sessionFactory.getCurrentSession());
    }

    @Override
    public String getHetuByOid(String henkiloOid) {
        HibernateQueryFactory hibernateQueryFactory = this.getHibernateQueryFactory();
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return hibernateQueryFactory.selectFrom(qHenkilo).select(qHenkilo.hetu)
                .where(qHenkilo.oidHenkilo.eq(henkiloOid))
                .fetchOne();
    }
}
