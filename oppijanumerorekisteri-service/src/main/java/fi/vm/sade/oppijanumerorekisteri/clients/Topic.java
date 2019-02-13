package fi.vm.sade.oppijanumerorekisteri.clients;

public interface Topic<T> {
    void publish(T object);
}
