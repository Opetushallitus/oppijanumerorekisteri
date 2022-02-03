package fi.vm.sade.oppijanumerorekisteri.exceptions;

public class ConflictException extends OppijanumerorekisteriException {
    private static final long serialVersionUID = -6678221361976956430L;

    public ConflictException() {
        super();
    }

    public ConflictException(String message) {
        super(message);
    }
}
