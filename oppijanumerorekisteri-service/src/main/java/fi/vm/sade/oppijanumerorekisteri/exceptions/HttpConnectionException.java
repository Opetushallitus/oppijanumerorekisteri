package fi.vm.sade.oppijanumerorekisteri.exceptions;

public class HttpConnectionException extends OppijanumerorekisteriException {

    public HttpConnectionException() {
        super();
    }

    public HttpConnectionException(String message) {
        super(message);
    }

    public HttpConnectionException(String message, Throwable cause) {
        super(message, cause);
    }

}
