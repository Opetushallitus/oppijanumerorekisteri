package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysHakemus;
import fi.vm.sade.oppijanumerorekisteri.models.QAsiayhteysHakemus;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.AsiayhteysHakemusRepositoryCustom;
import java.util.List;
import javax.persistence.EntityManager;
import org.springframework.data.jpa.repository.JpaContext;

public class AsiayhteysHakemusRepositoryImpl implements AsiayhteysHakemusRepositoryCustom {

    private final EntityManager entityManager;

    public AsiayhteysHakemusRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(AsiayhteysHakemus.class);
    }

    @Override
    public List<AsiayhteysHakemus> findByHenkiloOid(String oid) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QAsiayhteysHakemus qAsiayhteysHakemus = QAsiayhteysHakemus.asiayhteysHakemus;

        return new JPAQuery<>(entityManager)
                .from(qAsiayhteysHakemus)
                .join(qAsiayhteysHakemus.henkilo, qHenkilo)
                .where(qHenkilo.oidHenkilo.eq(oid))
                .select(qAsiayhteysHakemus)
                .fetch();
    }

}
