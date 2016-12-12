package fi.vm.sade.oppijanumerorekisteri.repositories.populator;

import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhmaKuvaus;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoTyyppi;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;

import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.YhteystietoPopulator.yhteystieto;

public class YhteystiedotRyhmaPopulator implements Populator<YhteystiedotRyhma> {
    private final YhteystietoRyhmaKuvaus ryhma;
    private final List<Populator<Yhteystieto>> yhteystiedot = new ArrayList<>();
    private String alkuperaTieto;

    public YhteystiedotRyhmaPopulator(YhteystietoRyhmaKuvaus ryhma) {
        this.ryhma = ryhma;
    }
    
    public static YhteystiedotRyhmaPopulator ryhma(YhteystietoRyhmaKuvaus ryhma) {
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
        ryhma.setRyhmaKuvaus(this.ryhma.getRyhmanKuvaus());
        ryhma.setRyhmaAlkuperaTieto(alkuperaTieto);
        
        yhteystiedot.forEach(tietoPopulator -> {
            Yhteystieto tieto = tietoPopulator.apply(entityManager);
            tieto.setYhteystiedotRyhma(ryhma);
            ryhma.getYhteystieto().add(tieto);
        });
        
        return ryhma;
    }
}
