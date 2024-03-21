package fi.vm.sade.oppijanumerorekisteri.repositories.populator;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;

import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static java.util.Arrays.asList;
import static java.util.stream.Collectors.toSet;

public class TuontiPopulator implements Populator<Tuonti> {

    private final List<Populator<Henkilo>> henkilot = new ArrayList<>();
    private Date aikaleima = new Date();

    public static TuontiPopulator tuonti(Populator<Henkilo>... henkilo) {
        return new TuontiPopulator().henkilo(henkilo);
    }

    public TuontiPopulator henkilo(Populator<Henkilo>... henkilo) {
        this.henkilot.addAll(asList(henkilo));
        return this;
    }

    public TuontiPopulator aikaleima(Date aikaleima) {
        this.aikaleima = aikaleima;
        return this;
    }

    @Override
    public Tuonti apply(EntityManager entityManager) {
        Set<TuontiRivi> rivit = henkilot.stream()
                .map(henkilo -> henkilo.apply(entityManager))
                .map(TuontiRivi::new)
                .collect(toSet());

        Tuonti tuonti = new Tuonti();
        tuonti.setAikaleima(aikaleima);
        tuonti.setHenkilot(rivit);
        entityManager.persist(tuonti);
        return tuonti;
    }

}
