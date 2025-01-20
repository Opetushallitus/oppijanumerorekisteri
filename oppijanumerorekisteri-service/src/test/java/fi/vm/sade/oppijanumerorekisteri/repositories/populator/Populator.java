package fi.vm.sade.oppijanumerorekisteri.repositories.populator;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static java.util.Optional.ofNullable;

@FunctionalInterface
public interface Populator<T> extends Function<EntityManager, T> {
    static<T> Populator<T> constant(T entity) {
        return em -> entity;
    }
    
    static <T> T first(Query q) {
        @SuppressWarnings("unchecked")
        List<T> l = (List<T>)q.setMaxResults(1).getResultList();
        if (l.isEmpty()) {
            return null;
        }
        return l.get(0);
    }
    
    static <T> Optional<T> firstOptional(Query q) {
        return ofNullable(first(q));
    }
}
