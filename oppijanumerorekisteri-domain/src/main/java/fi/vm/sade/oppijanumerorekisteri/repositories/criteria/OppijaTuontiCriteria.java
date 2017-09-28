package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import static com.querydsl.core.types.dsl.Expressions.allOf;
import static com.querydsl.core.types.dsl.Expressions.anyOf;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QOrganisaatio;
import fi.vm.sade.oppijanumerorekisteri.models.QTuonti;
import fi.vm.sade.oppijanumerorekisteri.models.QTuontiRivi;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import io.swagger.annotations.ApiModelProperty;
import java.util.Set;
import javax.persistence.EntityManager;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.joda.time.DateTime;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class OppijaTuontiCriteria {

    private Long tuontiId;

    @ApiModelProperty("ISO 8601 -muodossa, esim. 2017-09-05T10:04:59Z")
    private DateTime muokattuJalkeen;

    @ApiModelProperty(hidden = true)
    private Set<String> organisaatioOids;

    private Boolean vainVirheet;

    public boolean setOrRetainOrganisaatioOids(Set<String> oids) {
        if (organisaatioOids == null || organisaatioOids.isEmpty()) {
            organisaatioOids = oids;
            return true;
        }
        return organisaatioOids.retainAll(oids);
    }

    /**
     * Palauttaa kyselyn tästä hakukriteeristä.
     *
     * @param entityManager
     * @param qHenkilo
     * @return kysely
     */
    public JPAQuery<?> getQuery(EntityManager entityManager, QHenkilo qHenkilo) {
        JPAQuery<?> query = new JPAQuery<>(entityManager).from(qHenkilo);

        if (tuontiId != null) {
            QTuonti qTuonti = QTuonti.tuonti;
            QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;

            JPQLQuery<Tuonti> subQuery = JPAExpressions.selectFrom(qTuonti)
                    .join(qTuonti.henkilot, qTuontiRivi)
                    .where(qTuontiRivi.henkilo.eq(qHenkilo))
                    .where(qTuonti.id.eq(tuontiId));
            query.where(subQuery.exists());
        }
        if (muokattuJalkeen != null) {
            query.where(qHenkilo.modified.goe(muokattuJalkeen.toDate()));
        }
        if (organisaatioOids != null) {
            QOrganisaatio qOrganisaatio = QOrganisaatio.organisaatio;

            query.join(qHenkilo.organisaatiot, qOrganisaatio);
            query.where(qOrganisaatio.oid.in(organisaatioOids));
        }
        if (Boolean.TRUE.equals(vainVirheet)) {
            query.where(anyOf(
                    allOf(
                            qHenkilo.hetu.isNull(),
                            qHenkilo.yksiloity.isFalse(),
                            qHenkilo.yksiloityVTJ.isFalse()
                    ),
                    allOf(
                            qHenkilo.hetu.isNotNull(),
                            qHenkilo.yksiloity.isFalse(),
                            qHenkilo.yksiloityVTJ.isFalse(),
                            qHenkilo.yksilointiYritetty.isTrue()
                    )
            ));
        }

        return query;
    }

}
