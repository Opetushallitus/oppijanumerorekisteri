package fi.vm.sade.oppijanumerorekisteri;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;

import java.util.ArrayList;
import java.util.List;

import static java.util.Objects.requireNonNull;
import static java.util.stream.Collectors.toList;

public final class KoodiTypeListBuilder {

    private final Koodisto koodisto;
    private final List<KoodiTypeBuilder> koodiTypeBuilders = new ArrayList<>();

    public KoodiTypeListBuilder(Koodisto koodisto) {
        this.koodisto = requireNonNull(koodisto);
    }

    public KoodiTypeListBuilder koodi(String koodi) {
        return koodi(new KoodiTypeBuilder(koodisto, requireNonNull(koodi)));
    }

    public KoodiTypeListBuilder koodi(KoodiTypeBuilder builder) {
        this.koodiTypeBuilders.add(requireNonNull(builder));
        return this;
    }

    public List<KoodiType> build() {
        return koodiTypeBuilders.stream().map(KoodiTypeBuilder::build).collect(toList());
    }

}
