package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepositoryCustom;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import org.springframework.data.jpa.repository.JpaContext;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public class TuontiRepositoryImpl implements TuontiRepositoryCustom {

    private final EntityManager entityManager;

    public TuontiRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(Tuonti.class);
    }

    @Override
    public Optional<Tuonti> findForUpdateById(Long id) {
        Tuonti entity = entityManager.find(Tuonti.class, id, LockModeType.PESSIMISTIC_WRITE);
        return Optional.ofNullable(entity);
    }

    @Override
    public List<TuontiRivi> findRiviBy(OppijaTuontiCriteria criteria, boolean isSuperUser) {
        QTuonti qTuonti = QTuonti.tuonti;
        QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QYhteystiedotRyhma qYhteystiedotRyhma = QYhteystiedotRyhma.yhteystiedotRyhma;
        QYhteystieto qYhteystieto = QYhteystieto.yhteystieto;

        JPAQuery<TuontiRivi> query = new JPAQuery<>(entityManager)
                .from(qTuonti)
                .join(qTuonti.henkilot, qTuontiRivi)
                .join(qTuontiRivi.henkilo, qHenkilo).fetchJoin()
                .leftJoin(qHenkilo.yhteystiedotRyhma, qYhteystiedotRyhma).fetchJoin()
                .leftJoin(qYhteystiedotRyhma.yhteystieto, qYhteystieto).fetchJoin()
                .select(qTuontiRivi)
                .where(qTuonti.id.eq(criteria.getTuontiId()));

        if (!isSuperUser) {
            QOrganisaatio qOrganisaatio = QOrganisaatio.organisaatio;
            query.join(qHenkilo.organisaatiot, qOrganisaatio);
            query.where(qOrganisaatio.oid.in(criteria.getOrganisaatioOids()));
        }

        return query.fetch();
    }

    @Override
    public List<Tuonti> findTuontiWithIlmoitustarve() {
        QTuonti qTuonti = QTuonti.tuonti;
        QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<Tuonti> query = new JPAQuery<>(entityManager)
                .from(qTuonti)
                .join(qTuonti.henkilot, qTuontiRivi)
                .join(qTuontiRivi.henkilo, qHenkilo)
                .select(qTuonti)
                .where(qTuonti.kasiteltyja.eq(qTuonti.kasiteltavia)
                        .and(qTuonti.sahkoposti.isNotNull())
                        .and( qHenkilo.yksilointiYritetty.isTrue()
                                .and(qHenkilo.yksiloity.isFalse())
                                .and(qHenkilo.yksiloityVTJ.isFalse())
                                .and(qHenkilo.yksiloityEidas.isFalse()))
                        .and(qTuonti.ilmoitustarveKasitelty.isFalse()) );
        return query.fetch();
    }

    @Override
    public List<Tuonti> findNotKasiteltyTuontiWithoutIlmoitustarve() {
        QTuonti qTuonti = QTuonti.tuonti;
        QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<Tuonti> query = new JPAQuery<>(entityManager)
                .from(qTuonti)
                    .join(qTuonti.henkilot, qTuontiRivi)
                    .join(qTuontiRivi.henkilo, qHenkilo)
                .select(qTuonti)
                .where( qTuonti.kasiteltyja.eq(qTuonti.kasiteltavia)
                            .and( qTuonti.ilmoitustarveKasitelty.isFalse())
                            .and( qHenkilo.yksilointiYritetty.isTrue()
                                .and( qHenkilo.yksiloity.isTrue().or( qHenkilo.yksiloityVTJ.isTrue() ).or( qHenkilo.yksiloityEidas.isTrue() )
                                .or(qTuonti.sahkoposti.isNull()))
                        ));
        return query.fetch();
    }

}
