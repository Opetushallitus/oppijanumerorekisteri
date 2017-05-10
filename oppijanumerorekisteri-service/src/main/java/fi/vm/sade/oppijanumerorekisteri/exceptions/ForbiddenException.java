package fi.vm.sade.oppijanumerorekisteri.exceptions;

public class ForbiddenException extends OppijanumerorekisteriException {

    public ForbiddenException() {
    }

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }

}
