package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepositoryCustom;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import java.util.List;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaContext;

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

}
