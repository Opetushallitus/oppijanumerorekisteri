package fi.vm.sade.oppijanumerorekisteri.exceptions;

public abstract class OppijanumerorekisteriException extends RuntimeException {
    private static final long serialVersionUID = 6585703362358144315L;

    public OppijanumerorekisteriException() {
        super();
    }

    public OppijanumerorekisteriException(String message) {
        super(message);
    }
}
