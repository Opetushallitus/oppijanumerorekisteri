package fi.vm.sade.oppijanumerorekisteri.dto;

@FunctionalInterface
public interface Setter<T,E> {
    void set(T obj, E value);
}
