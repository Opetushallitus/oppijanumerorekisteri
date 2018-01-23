package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QYksilointitieto;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointitieto;
import javax.persistence.EntityManager;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class YksilointitietoCriteria {

    private Boolean passivoitu;
    private Boolean duplikaatti;

    public JPAQuery<?> getQuery(EntityManager entityManager, QYksilointitieto qYksilointitieto) {
        QHenkilo qHenkilo = QHenkilo.henkilo;

        JPAQuery<Yksilointitieto> query = new JPAQuery<Yksilointitieto>(entityManager)
                .from(qYksilointitieto)
                .join(qYksilointitieto.henkilo, qHenkilo).fetchJoin();

        if (passivoitu != null) {
            query.where(qHenkilo.passivoitu.eq(passivoitu));
        }
        if (duplikaatti != null) {
            query.where(qHenkilo.duplicate.eq(duplikaatti));
        }

        return query;
    }

}
