package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
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

    public Predicate condition(QHenkilo henkilo) {
        BooleanBuilder builder = new BooleanBuilder();
        if (henkiloOids != null) {
            builder.and(henkilo.oidHenkilo.in(henkiloOids));
        }
        if (hetu != null) {
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
        return builder;
    }
}
