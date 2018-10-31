package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksiloityHetuRepository;
import org.springframework.data.jpa.repository.JpaContext;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import java.util.Collection;

@Repository
public class YksiloityHetuRepositoryImpl implements YksiloityHetuRepository {

    private final EntityManager entityManager;

    public YksiloityHetuRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(Henkilo.class);
    }

    @Override
    public Collection<String> findAll() {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        StringPath qYksiloityHetu = Expressions.stringPath("yksiloityHetu");
        return new JPAQuery<>(entityManager)
                .from(qHenkilo)
                .join(qHenkilo.yksiloityHetu, qYksiloityHetu)
                .select(qYksiloityHetu)
                .fetch();
    }

    @Override
    public Collection<String> findByHenkilo(Henkilo henkilo) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        StringPath qYksiloityHetu = Expressions.stringPath("yksiloityHetu");
        return new JPAQuery<>(entityManager)
                .from(qHenkilo)
                .join(qHenkilo.yksiloityHetu, qYksiloityHetu)
                .where(qHenkilo.eq(henkilo))
                .select(qYksiloityHetu)
                .fetch();
    }

    @Override
    public Collection<String> findByHenkiloOid(String oid) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        StringPath qYksiloityHetu = Expressions.stringPath("yksiloityHetu");
        return new JPAQuery<>(entityManager)
                .from(qHenkilo)
                .join(qHenkilo.yksiloityHetu, qYksiloityHetu)
                .where(qHenkilo.oidHenkilo.eq(oid))
                .select(qYksiloityHetu)
                .fetch();
    }

}
