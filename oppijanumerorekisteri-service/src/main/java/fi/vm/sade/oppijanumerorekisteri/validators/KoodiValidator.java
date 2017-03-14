package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import java.util.Set;
import static java.util.stream.Collectors.toSet;
import static java.util.stream.StreamSupport.stream;
import org.springframework.validation.Errors;

/**
 * Apuluokka koodiston koodien validointiin.
 */
public class KoodiValidator {

    private final KoodistoService koodistoService;
    private final Errors errors;

    public KoodiValidator(KoodistoService koodistoService, Errors errors) {
        this.koodistoService = koodistoService;
        this.errors = errors;
    }

    public void validate(Koodisto koodisto, String koodi, String field, String errorCode) {
        if (koodi == null) {
            return;
        }
        Iterable<KoodiType> koodit = koodistoService.list(koodisto);
        if (stream(koodit.spliterator(), false)
                .noneMatch(t -> t.getKoodiArvo().equals(koodi))) {
            errors.rejectValue(field, errorCode, new Object[]{koodi}, "Tuntematon koodiston '" + koodisto.getUri() + "' koodi " + koodi);
        }
    }

    public void validate(Koodisto koodisto, Set<String> koodit, String field, String errorCode) {
        if (koodit == null || koodit.isEmpty()) {
            return;
        }
        Iterable<KoodiType> types = koodistoService.list(koodisto);
        Set<String> invalid = koodit.stream()
                .filter(koodi -> stream(types.spliterator(), false).noneMatch(t -> t.getKoodiArvo().equals(koodi)))
                .collect(toSet());
        if (!invalid.isEmpty()) {
            errors.rejectValue(field, errorCode, new Object[]{invalid}, "Tuntematon koodiston '" + koodisto.getUri() + "' koodit " + invalid);
        }
    }

}
