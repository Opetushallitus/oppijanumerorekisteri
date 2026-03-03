package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

public class MailboxNotInUseException extends RuntimeException {
  public MailboxNotInUseException() {
    super("Mailbox not in use");
  }
}
