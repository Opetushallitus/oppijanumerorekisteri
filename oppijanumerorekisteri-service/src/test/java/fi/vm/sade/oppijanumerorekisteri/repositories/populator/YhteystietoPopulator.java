package fi.vm.sade.oppijanumerorekisteri.repositories.populator;

import fi.vm.sade.oppijanumerorekisteri.models.Yhteystieto;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystietoTyyppi;

import javax.persistence.EntityManager;

public class YhteystietoPopulator implements Populator<Yhteystieto> {
    private final YhteystietoTyyppi tyyppi;
    private final String arvo;

    public YhteystietoPopulator(YhteystietoTyyppi tyyppi, String arvo) {
        this.tyyppi = tyyppi;
        this.arvo = arvo;
    }
    
    public static YhteystietoPopulator yhteystieto(YhteystietoTyyppi tyyppi, String arvo) {
        return new YhteystietoPopulator(tyyppi, arvo);
    }

    @Override
    public Yhteystieto apply(EntityManager entityManager) {
        Yhteystieto tieto = new Yhteystieto();
        tieto.setYhteystietoTyyppi(tyyppi);
        tieto.setYhteystietoArvo(arvo);
        return tieto;
    }
}
