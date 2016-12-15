package fi.vm.sade.oppijanumerorekisteri.exceptions;

public class DuplicateHetuException extends OppijanumerorekisteriException {
    private static final long serialVersionUID = 4019584641880865658L;

     public DuplicateHetuException() {
         super();
     }

     public DuplicateHetuException(String message) {
         super(message);
     }
}
