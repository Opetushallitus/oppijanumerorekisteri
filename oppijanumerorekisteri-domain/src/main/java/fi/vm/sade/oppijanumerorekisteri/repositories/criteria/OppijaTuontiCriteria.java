package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQuery;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QOrganisaatio;
import fi.vm.sade.oppijanumerorekisteri.models.QTuonti;
import fi.vm.sade.oppijanumerorekisteri.models.QTuontiRivi;
import io.swagger.annotations.ApiModelProperty;
import lombok.*;
import org.joda.time.DateTime;
import org.springframework.util.StringUtils;

import jakarta.persistence.EntityManager;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import static com.querydsl.core.types.dsl.Expressions.allOf;
import static com.querydsl.core.types.dsl.Expressions.anyOf;
import static java.util.stream.Collectors.toList;

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

    private boolean vainVirheet;

    private String nimiHaku;

    public void setOrRetainOrganisaatioOids(Set<String> oids) {
        if (organisaatioOids == null || organisaatioOids.isEmpty()) {
            organisaatioOids = oids;
        } else {
            organisaatioOids.retainAll(oids);
        }
    }

    public boolean hasConditions() {
        return tuontiId != null || muokattuJalkeen != null || this.organisaatioOids != null || this.vainVirheet || StringUtils.hasLength(this.nimiHaku);
    }

    /**
     * Palauttaa kyselyn tästä hakukriteeristä.
     *
     * @param entityManager entity manager instance
     * @param qHenkilo      entity serializer
     * @return kysely
     */
    public JPAQuery<?> getQuery(EntityManager entityManager, QHenkilo qHenkilo) {
        QTuonti qTuonti = QTuonti.tuonti;
        QTuontiRivi qTuontiRivi = QTuontiRivi.tuontiRivi;
        JPAQuery<?> query = new JPAQuery<>(entityManager)
                // haetaan aina vain tuontiin liitettyjä henkilöitä
                .from(qTuonti)
                .join(qTuonti.henkilot, qTuontiRivi)
                .join(qTuontiRivi.henkilo, qHenkilo);

        if (tuontiId != null) {
            query.where(qTuonti.id.eq(tuontiId));
        }
        if (muokattuJalkeen != null) {
            query.where(qHenkilo.modified.goe(muokattuJalkeen.toDate()));
        }
        if (organisaatioOids != null) {
            QOrganisaatio qOrganisaatio = QOrganisaatio.organisaatio;

            query.join(qHenkilo.organisaatiot, qOrganisaatio);
            query.where(qOrganisaatio.oid.in(organisaatioOids));
        }
        if (vainVirheet) {
            List<BooleanExpression> conditions = Stream.of(
                    allOf(
                            qHenkilo.hetu.isNull(),
                            qHenkilo.yksiloity.isFalse(),
                            qHenkilo.yksiloityVTJ.isFalse()),
                    allOf(
                            qHenkilo.hetu.isNotNull(),
                            qHenkilo.yksiloity.isFalse(),
                            qHenkilo.yksiloityVTJ.isFalse(),
                            qHenkilo.yksilointiYritetty.isTrue())
            ).collect(toList());
            query.where(allOf(
                    qHenkilo.duplicate.isFalse(),
                    qHenkilo.passivoitu.isFalse(),
                    anyOf(conditions.toArray(new BooleanExpression[0]))));
        }

        if (StringUtils.hasLength(this.nimiHaku)) {
            String trimmedQuery = this.nimiHaku.trim();
            List<String> queryParts = Arrays.asList(trimmedQuery.split(" "));

            if (queryParts.size() > 1) {
                // expect sukunimi to be first or last of queryParts
                // use startsWithIgnoreCase to get use of index

                BooleanBuilder SukunimiEtunimiPredicate = new BooleanBuilder();
                SukunimiEtunimiPredicate.and(qHenkilo.sukunimi.startsWithIgnoreCase(queryParts.get(0)));
                String etunimiLast = String.join(" ", queryParts.subList(1, queryParts.size()));
                SukunimiEtunimiPredicate.and(qHenkilo.etunimet.startsWithIgnoreCase(etunimiLast)
                        .or(qHenkilo.kutsumanimi.startsWithIgnoreCase(etunimiLast)));

                BooleanBuilder etunimiSukunimiPredicate = new BooleanBuilder();
                etunimiSukunimiPredicate.and(qHenkilo.sukunimi.startsWithIgnoreCase(queryParts.get(queryParts.size() - 1)));
                String etunimiFirst = String.join(" ", queryParts.subList(0, queryParts.size() - 1));
                etunimiSukunimiPredicate.and(qHenkilo.etunimet.startsWithIgnoreCase(etunimiFirst)
                        .or(qHenkilo.kutsumanimi.startsWithIgnoreCase(etunimiFirst)));

                query.where(SukunimiEtunimiPredicate
                        .or(etunimiSukunimiPredicate)
                        .or(qHenkilo.etunimet.startsWithIgnoreCase(trimmedQuery)));
            } else {
                query.where(
                        Expressions.anyOf(
                                qHenkilo.oidHenkilo.eq(trimmedQuery),
                                qHenkilo.etunimet.startsWithIgnoreCase(trimmedQuery),
                                qHenkilo.sukunimi.startsWithIgnoreCase(trimmedQuery),
                                qHenkilo.kutsumanimi.startsWithIgnoreCase(trimmedQuery),
                                qHenkilo.hetu.eq(trimmedQuery)
                        )
                );
            }
        }

        return query;
    }
}
