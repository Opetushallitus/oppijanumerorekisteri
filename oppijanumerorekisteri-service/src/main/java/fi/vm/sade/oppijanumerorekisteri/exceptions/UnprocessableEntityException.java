package fi.vm.sade.oppijanumerorekisteri.exceptions;

import static java.util.Objects.requireNonNull;
import org.springframework.validation.Errors;

public class UnprocessableEntityException extends OppijanumerorekisteriException {

    private final Errors errors;

    public UnprocessableEntityException(Errors errors) {
        this.errors = requireNonNull(errors);
    }

    public Errors getErrors() {
        return errors;
    }

}
