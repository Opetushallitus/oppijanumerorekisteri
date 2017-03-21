package fi.vm.sade.oppijanumerorekisteri.exceptions;

import org.springframework.validation.BindException;

public class ValidationException extends OppijanumerorekisteriException {
    private static final long serialVersionUID = -6678221361976956430L;

    public ValidationException() {
        super();
    }

    public ValidationException(String message) {
        super(message);
    }

    /**
     * @param be bind exception
     * @deprecated käytä {@link UnprocessableException}
     */
    @Deprecated
    public ValidationException(BindException be) {
        super(be.getMessage(), be.getCause());
    }
}
