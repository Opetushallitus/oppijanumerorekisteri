package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.HuoltajasuhdeRepository;

import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.hibernate.envers.query.AuditQuery;

import org.springframework.data.jpa.repository.JpaContext;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import java.util.*;

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
                .add(AuditEntity.revisionProperty("timestamp").le(Timestamp.valueOf(LocalDateTime.of(end,   LocalTime.MIN)).getTime()));

        return henkiloHuoltajaSuhteet.getResultList();
    }
}
