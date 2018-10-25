package fi.vm.sade.oppijanumerorekisteri.repositories.populator;

import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static java.util.Arrays.asList;
import static java.util.stream.Collectors.toSet;

public class TuontiPopulator implements Populator<Tuonti> {

    private final List<Populator<Henkilo>> henkilot = new ArrayList<>();

    public static TuontiPopulator tuonti(Populator<Henkilo>... henkilo) {
        return new TuontiPopulator().henkilo(henkilo);
    }

    public TuontiPopulator henkilo(Populator<Henkilo>... henkilo) {
        this.henkilot.addAll(asList(henkilo));
        return this;
    }

    @Override
    public Tuonti apply(EntityManager entityManager) {
        Set<TuontiRivi> rivit = henkilot.stream()
                .map(henkilo -> henkilo.apply(entityManager))
                .map(henkilo -> new TuontiRivi(henkilo))
                .collect(toSet());

        Tuonti tuonti = new Tuonti();
        tuonti.setHenkilot(rivit);
        entityManager.persist(tuonti);
        return tuonti;
    }

}
