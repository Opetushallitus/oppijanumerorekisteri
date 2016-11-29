package fi.vm.sade.oppijanumerorekisteri.exceptions;

public class ValidationException extends OppijanumerorekisteriException {
    private static final long serialVersionUID = -4698101985120255199L;

    public ValidationException() {
        super();
    }

    public ValidationException(String message) {
        super(message);
    }
}
