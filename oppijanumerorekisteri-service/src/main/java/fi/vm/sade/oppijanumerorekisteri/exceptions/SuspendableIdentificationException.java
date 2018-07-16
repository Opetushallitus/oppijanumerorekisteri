package fi.vm.sade.oppijanumerorekisteri.exceptions;

public class SuspendableIdentificationException extends OppijanumerorekisteriException {

    public SuspendableIdentificationException() {
    }

    public SuspendableIdentificationException(String message) {
        super(message);
    }

    public SuspendableIdentificationException(String message, Throwable cause) {
        super(message, cause);
    }

}
