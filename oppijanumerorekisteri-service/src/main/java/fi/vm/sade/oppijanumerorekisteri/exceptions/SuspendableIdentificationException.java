package fi.vm.sade.oppijanumerorekisteri.exceptions;

public class SuspendableIdentificationException extends OppijanumerorekisteriException {

    private static final long serialVersionUID = 6829796421533806406L;

    public SuspendableIdentificationException() {
    }

    public SuspendableIdentificationException(String message) {
        super(message);
    }

    public SuspendableIdentificationException(String message, Throwable cause) {
        super(message, cause);
    }

}
