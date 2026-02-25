package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QIdentification;
import fi.vm.sade.oppijanumerorekisteri.repositories.IdentificationRepositoryCustom;
import org.springframework.data.jpa.repository.JpaContext;

import jakarta.persistence.EntityManager;

import java.util.List;

public class IdentificationRepositoryImpl implements IdentificationRepositoryCustom {

    private final EntityManager entityManager;

    public IdentificationRepositoryImpl(JpaContext jpaContext) {
        this.entityManager = jpaContext.getEntityManagerByManagedType(Identification.class);
    }

    @Override
    public Iterable<Identification> findByHenkiloOid(String henkiloOid) {
        JPAQuery<Identification> query = new JPAQuery<>(entityManager);

        QHenkilo qHenkilo = QHenkilo.henkilo;
        QIdentification qIdentification = QIdentification.identification;

        return query.from(qHenkilo)
                .join(qHenkilo.identifications, qIdentification)
                .where(qHenkilo.oidHenkilo.eq(henkiloOid))
                .select(qIdentification)
                .fetch();
    }

    public List<Identification> findIdentical(IdentificationDto identification) {
        JPAQuery<Identification> query = new JPAQuery<>(entityManager);

        QIdentification qIdentification = QIdentification.identification;

        return query
                .select(qIdentification)
                .from(qIdentification)
                .where(
                        qIdentification.identifier.eq(identification.getIdentifier()),
                        qIdentification.idpEntityId.eq(identification.getIdpEntityId()))
                .fetch();
    }
}
