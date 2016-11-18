package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QYhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.QYhteystieto;

public class YhteystietoCriteria {
    private String henkiloOidEquals;
    private String ryhmaKuvausEquals;
    
    public YhteystietoCriteria withHenkiloOid(String henkiloOid) {
        this.henkiloOidEquals = henkiloOid;
        return this;
    }

    public YhteystietoCriteria withRyhma(YhteystietoRyhma ryhma) {
        this.ryhmaKuvausEquals = ryhma == null ? null : ryhma.getRyhmanKuvaus();
        return this;
    }
    
    public BooleanExpression condition(QHenkilo henkilo, QYhteystiedotRyhma ryhma, QYhteystieto yhteystieto) {
        BooleanExpression condition = Expressions.TRUE.eq(true);
        if (henkiloOidEquals != null) {
            condition = condition.and(henkilo.oidhenkilo.eq(henkiloOidEquals));
        }
        if (ryhmaKuvausEquals != null) {
            condition = condition.and(ryhma.ryhmaKuvaus.eq(ryhmaKuvausEquals));
        }
        return condition;
    }
}
