package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QOrganisaatio;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepositoryCustom;
import java.util.List;
import javax.persistence.EntityManager;
import org.springframework.data.jpa.repository.JpaContext;

public class OrganisaatioRepositoryImpl implements OrganisaatioRepositoryCustom {

    private final EntityManager entityManager;

    public OrganisaatioRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(Organisaatio.class);
    }

    @Override
    public List<String> findOidByHenkiloOid(String henkiloOid) {
        QHenkilo qHenkilo = QHenkilo.henkilo;
        QOrganisaatio qOrganisaatio = QOrganisaatio.organisaatio;

        return new JPAQuery<>(entityManager)
                .from(qHenkilo)
                .join(qHenkilo.organisaatiot, qOrganisaatio)
                .where(qHenkilo.oidHenkilo.eq(henkiloOid))
                .select(qOrganisaatio.oid)
                .fetch();
    }

}
