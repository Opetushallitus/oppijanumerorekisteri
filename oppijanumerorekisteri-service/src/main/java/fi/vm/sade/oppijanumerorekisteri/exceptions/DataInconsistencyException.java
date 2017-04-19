package fi.vm.sade.oppijanumerorekisteri.exceptions;

public class DataInconsistencyException extends OppijanumerorekisteriException {

    public DataInconsistencyException() {
    }

    public DataInconsistencyException(String message) {
        super(message);
    }

    public DataInconsistencyException(String message, Throwable cause) {
        super(message, cause);
    }

}
