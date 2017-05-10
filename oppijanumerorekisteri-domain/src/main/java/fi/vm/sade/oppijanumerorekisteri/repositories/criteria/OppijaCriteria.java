package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.Expressions;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
public class OppijaCriteria {

    private String hakutermi;
    private Boolean passivoitu;
    private Boolean duplikaatti;

    public Predicate condition(QHenkilo qHenkilo) {
        BooleanBuilder builder = new BooleanBuilder();

        if (hakutermi != null) {
            builder.and(Expressions.anyOf(qHenkilo.hetu.eq(hakutermi),
                    qHenkilo.etunimet.containsIgnoreCase(hakutermi),
                    qHenkilo.kutsumanimi.containsIgnoreCase(hakutermi),
                    qHenkilo.sukunimi.containsIgnoreCase(hakutermi),
                    qHenkilo.oidHenkilo.eq(hakutermi)
            ));
        }
        if (passivoitu != null) {
            builder.and(qHenkilo.passivoitu.eq(passivoitu));
        }
        if (duplikaatti != null) {
            builder.and(qHenkilo.duplicate.eq(duplikaatti));
        }

        return builder;
    }

}
