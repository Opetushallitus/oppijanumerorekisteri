package fi.vm.sade.oppijanumerorekisteri.repositories.populator;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;

import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;

import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.YhteystietoPopulator.yhteystieto;

public class YhteystiedotRyhmaPopulator implements Populator<YhteystiedotRyhma> {
    private final String ryhma;
    private final List<Populator<Yhteystieto>> yhteystiedot = new ArrayList<>();
    private String alkuperaTieto;

    public YhteystiedotRyhmaPopulator(String ryhma) {
        this.ryhma = ryhma;
    }
    
    public static YhteystiedotRyhmaPopulator ryhma(String ryhma) {
        return new YhteystiedotRyhmaPopulator(ryhma);
    }
    
    public YhteystiedotRyhmaPopulator alkupera(String alkuperaTieto) {
        this.alkuperaTieto = alkuperaTieto;
        return this;
    }
    
    public YhteystiedotRyhmaPopulator tieto(YhteystietoTyyppi tyyppi, String value) {
        return tieto(yhteystieto(tyyppi, value));
    }

    public YhteystiedotRyhmaPopulator tieto(Populator<Yhteystieto> yhteystieto) {
        this.yhteystiedot.add(yhteystieto);
        return this;
    }

    @Override
    public YhteystiedotRyhma apply(EntityManager entityManager) {
        YhteystiedotRyhma ryhma = new YhteystiedotRyhma();
        ryhma.setRyhmaKuvaus(this.ryhma);
        ryhma.setRyhmaAlkuperaTieto(alkuperaTieto);
        
        yhteystiedot.forEach(tietoPopulator -> {
            Yhteystieto tieto = tietoPopulator.apply(entityManager);
            ryhma.getYhteystieto().add(tieto);
        });
        
        return ryhma;
    }
}
