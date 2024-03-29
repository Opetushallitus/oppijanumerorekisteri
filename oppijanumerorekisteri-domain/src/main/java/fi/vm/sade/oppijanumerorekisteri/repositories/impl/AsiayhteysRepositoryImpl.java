package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.AsiayhteysRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.AsiayhteysCriteria;
import org.springframework.data.jpa.repository.JpaContext;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import java.util.List;

import static java.util.Arrays.asList;

@Repository
public class AsiayhteysRepositoryImpl implements AsiayhteysRepository {

    private final EntityManager entityManager;

    public AsiayhteysRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(Henkilo.class);
    }

    @Override
    public List<Henkilo> findLisattavat(AsiayhteysCriteria criteria, long limit) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<Henkilo> query = new JPAQuery<>(entityManager)
                .from(qHenkilo)
                .where(qHenkilo.hetu.isNotNull())
                .where(qHenkilo.vtjRegister.isFalse())
                .where(qHenkilo.passivoitu.isFalse())
                .where(qHenkilo.yksiloityVTJ.isTrue())
                .limit(limit)
                .select(qHenkilo);

        if (Boolean.TRUE.equals(criteria.getAsiayhteysKaytossa())) {
            BooleanBuilder predicate = getAsiayhteysQueries(qHenkilo, criteria).stream()
                    .map(JPQLQuery::exists)
                    .reduce(new BooleanBuilder(), BooleanBuilder::or, BooleanBuilder::or);
            query.where(predicate);
        }

        return query.fetch();
    }

    @Override
    public List<Henkilo> findPoistettavat(AsiayhteysCriteria criteria, long limit) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<Henkilo> query = new JPAQuery<>(entityManager)
                .from(qHenkilo)
                .where(qHenkilo.hetu.isNotNull())
                .where(qHenkilo.vtjRegister.isTrue())
                .limit(limit)
                .select(qHenkilo);

        if (Boolean.TRUE.equals(criteria.getAsiayhteysKaytossa())) {
            BooleanBuilder predicate = getAsiayhteysQueries(qHenkilo, criteria).stream()
                    .map(JPQLQuery::notExists)
                    .reduce(new BooleanBuilder(), BooleanBuilder::and, BooleanBuilder::and);
            query.where(predicate);
        }

        return query.fetch();
    }

    private List<JPQLQuery<Integer>> getAsiayhteysQueries(QHenkilo qHenkilo, AsiayhteysCriteria criteria) {
        // select 1 from asiayhteys_palvelu ap where ap.henkilo_id = h.id
        QAsiayhteysPalvelu qAsiayhteysPalvelu = QAsiayhteysPalvelu.asiayhteysPalvelu;
        JPQLQuery<Integer> palveluQuery = JPAExpressions.selectOne()
                .from(qAsiayhteysPalvelu)
                .where(qAsiayhteysPalvelu.henkilo.eq(qHenkilo));

        // select 1 from asiayhteys_hakemus ah where ah.henkilo_id = h.id and ah.loppupaivamaara >= ?
        QAsiayhteysHakemus qAsiayhteysHakemus = QAsiayhteysHakemus.asiayhteysHakemus;
        JPQLQuery<Integer> hakemusQuery = JPAExpressions.selectOne()
                .from(qAsiayhteysHakemus)
                .where(qAsiayhteysHakemus.henkilo.eq(qHenkilo))
                .where(qAsiayhteysHakemus.loppupaivamaara.goe(criteria.getLoppupaivamaara()));

        // select 1 from asiayhteys_kayttooikeus ak where ak.henkilo_id = h.id and ak.loppupaivamaara >= ?
        QAsiayhteysKayttooikeus qAsiayhteysKayttooikeus = QAsiayhteysKayttooikeus.asiayhteysKayttooikeus;
        JPQLQuery<Integer> kayttooikeusQuery = JPAExpressions.selectOne()
                .from(qAsiayhteysKayttooikeus)
                .where(qAsiayhteysKayttooikeus.henkilo.eq(qHenkilo))
                .where(qAsiayhteysKayttooikeus.loppupaivamaara.goe(criteria.getLoppupaivamaara()));

        return asList(palveluQuery, hakemusQuery, kayttooikeusQuery);
    }

}
