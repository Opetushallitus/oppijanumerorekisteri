package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import java.util.Set;
import java.util.function.Function;

import static java.util.function.Function.identity;
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

    public static boolean isValid(KoodistoService koodistoService, Koodisto koodisto, String koodi) {
        return isValid(koodistoService, koodisto, koodi, identity());
    }

    public static boolean isValid(KoodistoService koodistoService, Koodisto koodisto, String koodi, Function<String, String> koodiArvoMapper) {
        Iterable<KoodiType> koodit = koodistoService.list(koodisto);
        return stream(koodit.spliterator(), false).anyMatch(t -> koodiArvoMapper.apply(t.getKoodiArvo()).equals(koodi));
    }

    public void validate(Koodisto koodisto, String koodi, String field, String errorCode) {
        validate(koodisto, koodi, identity(), field, errorCode);
    }

    public void validate(Koodisto koodisto, String koodi, Function<String, String> koodiArvoMapper, String field, String errorCode) {
        if (koodi == null) {
            return;
        }
        if (!isValid(koodistoService, koodisto, koodi, koodiArvoMapper)) {
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
