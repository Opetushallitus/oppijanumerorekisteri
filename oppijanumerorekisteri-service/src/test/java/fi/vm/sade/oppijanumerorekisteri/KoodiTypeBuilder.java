package fi.vm.sade.oppijanumerorekisteri;

import fi.vm.sade.oppijanumerorekisteri.models.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;

import static java.util.Objects.requireNonNull;

public final class KoodiTypeBuilder {

    private final Koodisto koodisto;
    private final String koodi;
    private int versio;

    public KoodiTypeBuilder(Koodisto koodisto, String koodi) {
        this.koodisto = requireNonNull(koodisto);
        this.koodi = requireNonNull(koodi);
    }

    public KoodiTypeBuilder versio(int versio) {
        this.versio = versio;
        return this;
    }

    public KoodiType build() {
        KoodiType koodiType = new KoodiType();
        koodiType.setKoodiArvo(koodi);
        koodiType.setKoodiUri(koodisto.getUri() + "_" + koodi);
        koodiType.setVersio(versio);
        return koodiType;
    }

}
