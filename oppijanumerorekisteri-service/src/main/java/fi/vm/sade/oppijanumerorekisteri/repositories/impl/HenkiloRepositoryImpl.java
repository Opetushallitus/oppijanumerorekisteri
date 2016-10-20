package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;

@Transactional(propagation = Propagation.MANDATORY)
public class HenkiloRepositoryImpl implements HenkiloHibernateRepository {
    @PersistenceContext
    private EntityManager entityManager;

    private JPAQueryFactory getJpaQueryFactory() {
        return new JPAQueryFactory(this.entityManager);
    }

    @Override
    public Optional<String> findHetuByOid(String henkiloOid) {
        JPAQueryFactory jpaQueryFactory = this.getJpaQueryFactory();
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return Optional.ofNullable(jpaQueryFactory.selectFrom(qHenkilo).select(qHenkilo.hetu)
                .where(qHenkilo.oidhenkilo.eq(henkiloOid))
                .fetchOne());
    }

    @Override
    public Optional<String> findOidByHetu(String hetu) {
        JPAQueryFactory jpaQueryFactory = this.getJpaQueryFactory();
        QHenkilo qHenkilo = QHenkilo.henkilo;

        return Optional.ofNullable(jpaQueryFactory.selectFrom(qHenkilo).select(qHenkilo.oidhenkilo)
                .where(qHenkilo.hetu.eq(hetu))
                .fetchOne());
    }

    @Override
    public List<Henkilo> findHenkiloByEtunimetOrSukunimi(List<String> etunimet, String sukunimi) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        JPAQuery<Henkilo> query = this.getJpaQueryFactory().selectFrom(qHenkilo);
        query.select(qHenkilo);
        BooleanBuilder builder = new BooleanBuilder();
        for(String etunimi : etunimet) {
            builder.or(qHenkilo.etunimet.containsIgnoreCase(etunimi));
        }
        builder.and(qHenkilo.sukunimi.containsIgnoreCase(sukunimi));
        query = query.where(builder);
        return query.fetch();
    }
}
