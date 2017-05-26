package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Expression;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.core.types.dsl.StringPath;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import lombok.*;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Set;

/**
 * Henkilöiden hakemiseen oppijanumerorekisteristä henkilön perustietojen
 * perusteella.
 */
@Getter
@Setter
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloCriteria implements OppijanumerorekisteriCriteria {

    private Set<String> henkiloOids;
    private String hetu;
    private HenkiloTyyppi tyyppi;
    private Boolean passivoitu;
    private Boolean duplikaatti;
    private String nameQuery;

    public Predicate condition(QHenkilo henkilo) {
        BooleanBuilder builder = new BooleanBuilder();
        if (henkiloOids != null) {
            builder.and(henkilo.oidHenkilo.in(henkiloOids));
        }
        if (StringUtils.hasLength(this.hetu)) {
            builder.and(henkilo.hetu.eq(hetu));
        }
        if (tyyppi != null) {
            builder.and(henkilo.henkiloTyyppi.eq(tyyppi));
        }
        if (passivoitu != null) {
            builder.and(henkilo.passivoitu.eq(passivoitu));
        }
        if (duplikaatti != null) {
            builder.and(henkilo.duplicate.eq(duplikaatti));
        }
        if(StringUtils.hasLength(this.nameQuery)) {
            Arrays.stream(this.nameQuery.split(" ")).forEach(queryPart ->
                    builder.and(Expressions.anyOf(
                            henkilo.etunimet.containsIgnoreCase(queryPart),
                            henkilo.sukunimi.containsIgnoreCase(queryPart)
            )));
        }
        return builder;
    }
}
