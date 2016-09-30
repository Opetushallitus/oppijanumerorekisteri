package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.hibernate.HibernateQueryFactory;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public class HenkiloRepositoryImpl implements HenkiloHibernateRepository {
    private HibernateQueryFactory hibernateQueryFactory;

    @Autowired
    public HenkiloRepositoryImpl(LocalContainerEntityManagerFactoryBean entityManagerFactoryBean) {
        SessionFactory hibernateFactory = entityManagerFactoryBean.getNativeEntityManagerFactory().unwrap(SessionFactory.class);
        Session session = hibernateFactory.openSession();
        this.hibernateQueryFactory = new HibernateQueryFactory(session);
    }

    @Override
    public String getHetuByOid(String henkiloOid) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return hibernateQueryFactory.selectFrom(qHenkilo).select(qHenkilo.hetu)
                .where(qHenkilo.oidHenkilo.eq(henkiloOid))
                .fetchOne();
    }
}
