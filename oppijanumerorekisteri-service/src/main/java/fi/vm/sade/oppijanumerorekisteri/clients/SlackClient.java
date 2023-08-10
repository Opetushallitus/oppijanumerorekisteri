package fi.vm.sade.oppijanumerorekisteri.clients;

public interface SlackClient {
    void sendToSlack(String message, String codeBlock);
}
