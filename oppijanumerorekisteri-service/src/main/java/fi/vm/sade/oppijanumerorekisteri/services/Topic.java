package fi.vm.sade.oppijanumerorekisteri.services;

public interface Topic<T> {
    void publish(T object);
}
