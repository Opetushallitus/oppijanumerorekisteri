package fi.vm.sade.oppijanumerorekisteri.repositories;

import org.springframework.stereotype.Repository;

// High speed repository for jpa queries with querydsl.
@Repository
public interface HenkiloHibernateRepository {
    String getHetuByOid(String henkiloOid);
}
