package fi.vm.sade.oppijanumerorekisteri.exceptions;

public class UnauthorizedException extends OppijanumerorekisteriException {

    public UnauthorizedException() {
    }

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }

}
