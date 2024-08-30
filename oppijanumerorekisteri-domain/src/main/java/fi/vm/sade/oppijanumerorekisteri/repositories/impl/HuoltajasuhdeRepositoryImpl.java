package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkiloHuoltajaSuhde;
import fi.vm.sade.oppijanumerorekisteri.repositories.HuoltajasuhdeRepository;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.hibernate.envers.query.AuditQuery;
import org.joda.time.DateTime;
import org.springframework.data.jpa.repository.JpaContext;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public class HuoltajasuhdeRepositoryImpl implements HuoltajasuhdeRepository {

    private final EntityManager entityManager;

    public HuoltajasuhdeRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(HenkiloHuoltajaSuhde.class);
    }

    @Override
    public List<HenkiloHuoltajaSuhde> changesBetween(LocalDate start, LocalDate end) {
        AuditQuery henkiloHuoltajaSuhteet = AuditReaderFactory.get(entityManager).createQuery()
                .forRevisionsOfEntity(HenkiloHuoltajaSuhde.class, true, false)
                .add(AuditEntity.revisionProperty("timestamp").ge(Timestamp.valueOf(LocalDateTime.of(start, LocalTime.MIN)).getTime()))
                .add(AuditEntity.revisionProperty("timestamp").le(Timestamp.valueOf(LocalDateTime.of(end,   LocalTime.MAX)).getTime()));

        return henkiloHuoltajaSuhteet.getResultList();
    }

    @Override
    public List<String> changesSince(DateTime modifiedSince, Integer amount, Integer offset) {
        QHenkiloHuoltajaSuhde qHenkiloHuoltajaSuhde = QHenkiloHuoltajaSuhde.henkiloHuoltajaSuhde;
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<String> query = new JPAQuery<>(entityManager)
                .from(qHenkiloHuoltajaSuhde)
                .join(qHenkiloHuoltajaSuhde.lapsi, qHenkilo)
                .where(qHenkiloHuoltajaSuhde.updated.goe(modifiedSince.toDate()))
                .select(qHenkilo.oidHenkilo)
                .distinct();

        if(offset != null) {
            query.offset(offset);
        }
        if(amount != null) {
            query.limit(amount);
        } else {
            query.limit(10000);
        }
        return query.fetch();
    }

    @Override
    public List<HenkiloHuoltajaSuhde> findCurrentHuoltajatByHenkilo(String oid) {
        QHenkiloHuoltajaSuhde qHenkiloHuoltajaSuhde = QHenkiloHuoltajaSuhde.henkiloHuoltajaSuhde;
        QHenkilo qHenkilo = QHenkilo.henkilo;
        LocalDate now = LocalDate.now();

        JPAQuery<HenkiloHuoltajaSuhde> query = new JPAQuery<>(entityManager)
                .from(qHenkiloHuoltajaSuhde)
                .join(qHenkiloHuoltajaSuhde.lapsi, qHenkilo).on(qHenkilo.oidHenkilo.eq(oid))
                .where(
                        qHenkiloHuoltajaSuhde.alkuPvm.isNull().or(qHenkiloHuoltajaSuhde.alkuPvm.loe(now)),
                        qHenkiloHuoltajaSuhde.loppuPvm.isNull().or(qHenkiloHuoltajaSuhde.loppuPvm.after(now))
                ).select(qHenkiloHuoltajaSuhde);
        return query.fetch();
    }
}
