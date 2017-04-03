package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloCriteria {

    private Set<String> henkiloOids;
    private String hetu;
    private HenkiloTyyppi tyyppi;
    private Boolean passivoitu;
    private Boolean duplikaatti;

    public BooleanExpression condition(QHenkilo henkilo) {
        BooleanExpression condition = Expressions.TRUE.eq(true);
        if (henkiloOids != null) {
            if (henkiloOids.isEmpty()) {
                return Expressions.FALSE;
            }
            condition = condition.and(henkilo.oidHenkilo.in(henkiloOids));
        }
        if (hetu != null) {
            condition = condition.and(henkilo.hetu.eq(hetu));
        }
        if (tyyppi != null) {
            condition = condition.and(henkilo.henkiloTyyppi.eq(tyyppi));
        }
        if (passivoitu != null) {
            condition = condition.and(henkilo.passivoitu.eq(passivoitu));
        }
        if (duplikaatti != null) {
            condition = condition.and(henkilo.duplicate.eq(duplikaatti));
        }
        return condition;
    }
}
