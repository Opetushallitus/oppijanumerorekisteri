package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.AsiayhteysKayttooikeus;
import fi.vm.sade.oppijanumerorekisteri.models.QAsiayhteysKayttooikeus;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.AsiayhteysKayttooikeusRepositoryCustom;
import org.springframework.data.jpa.repository.JpaContext;

import javax.persistence.EntityManager;
import java.util.Optional;

public class AsiayhteysKayttooikeusRepositoryImpl implements AsiayhteysKayttooikeusRepositoryCustom {

    private final EntityManager entityManager;

    public AsiayhteysKayttooikeusRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(AsiayhteysKayttooikeus.class);
    }

    @Override
    public Optional<AsiayhteysKayttooikeus> findByHenkiloOid(String oid) {
        QAsiayhteysKayttooikeus qAsiayhteysKayttooikeus = QAsiayhteysKayttooikeus.asiayhteysKayttooikeus;
        QHenkilo qHenkilo = QHenkilo.henkilo;

        AsiayhteysKayttooikeus entity = new JPAQuery<>(entityManager)
                .from(qAsiayhteysKayttooikeus)
                .join(qAsiayhteysKayttooikeus.henkilo, qHenkilo)
                .where(qHenkilo.oidHenkilo.eq(oid))
                .select(qAsiayhteysKayttooikeus)
                .fetchOne();
        return Optional.ofNullable(entity);
    }

}
