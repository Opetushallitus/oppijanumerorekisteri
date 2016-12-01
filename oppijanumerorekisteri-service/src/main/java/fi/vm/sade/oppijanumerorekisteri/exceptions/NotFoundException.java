package fi.vm.sade.oppijanumerorekisteri.exceptions;

public class NotFoundException extends OppijanumerorekisteriException {
    private static final long serialVersionUID = -6678221361976956430L;

    public NotFoundException() {
        super();
    }

    public NotFoundException(String message) {
        super(message);
    }
}
