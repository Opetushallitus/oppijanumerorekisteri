package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.models.QOrganisaatio;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepositoryCustom;
import org.springframework.data.jpa.repository.JpaContext;

import jakarta.persistence.EntityManager;
import java.util.List;

public class OrganisaatioRepositoryImpl implements OrganisaatioRepositoryCustom {

    private final EntityManager entityManager;

    public OrganisaatioRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(Organisaatio.class);
    }

    @Override
    public List<String> findOidByHenkiloOid(String henkiloOid) {
        QHenkilo henkilo = QHenkilo.henkilo;
        QOrganisaatio organisaatio = QOrganisaatio.organisaatio;
        QHenkiloViite henkiloViite = QHenkiloViite.henkiloViite;

        return new JPAQuery<String>(entityManager).select(organisaatio.oid)
                .distinct()
                .from(henkilo)
                .join(henkilo.organisaatiot, organisaatio)
                .where(
                    henkilo.oidHenkilo.eq(henkiloOid)
                        .or(
                            henkilo.oidHenkilo.in(
                                JPAExpressions
                                    .select(henkiloViite.slaveOid)
                                    .from(henkiloViite)
                                    .where(
                                        henkiloViite.masterOid.eq(henkiloOid)
                                    )
                            )
                        )
                )
                .fetch();
    }

}
