package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
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
    
    public BooleanExpression condition(QHenkilo henkilo) {
        BooleanExpression condition = Expressions.TRUE.eq(true);
        if (henkiloOids != null) {
            if (henkiloOids.isEmpty()) {
                return Expressions.FALSE;
            }
            condition = condition.and(henkilo.oidHenkilo.in(henkiloOids));
        }
        return condition;
    }
}
