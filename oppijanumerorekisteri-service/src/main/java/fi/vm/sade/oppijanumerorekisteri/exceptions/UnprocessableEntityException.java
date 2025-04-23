package fi.vm.sade.oppijanumerorekisteri.exceptions;

import org.springframework.validation.Errors;

import static java.util.Objects.requireNonNull;

public class UnprocessableEntityException extends OppijanumerorekisteriException {

    private final Errors errors;

    public UnprocessableEntityException(Errors errors) {
        super(String.valueOf(errors));
        this.errors = requireNonNull(errors);
    }

    public Errors getErrors() {
        return errors;
    }

}
