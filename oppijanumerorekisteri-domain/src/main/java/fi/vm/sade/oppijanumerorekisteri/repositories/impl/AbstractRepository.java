package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.AllArgsConstructor;
import org.hibernate.Query;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

import static java.util.stream.Collectors.joining;

public class AbstractRepository {
    @PersistenceContext
    protected EntityManager em;

    protected JPAQueryFactory jpa() {
        return new JPAQueryFactory(em);
    }
    
    @AllArgsConstructor
    protected class Where {
        public final List<String> conditions = new ArrayList<>();
        public final List<Consumer<Query>> parameterSetters = new ArrayList<>();

        public<Q extends Query> Q apply(Q query) {
            parameterSetters.forEach(c -> c.accept(query));
            return query;
        }

        @Override
        public String toString() {
            return conditions.isEmpty() ? "" : "WHERE " + conditionsString();
        }

        public String toConditionString() {
            return conditions.isEmpty() ? "(1=1)" : "("+conditionsString()+")";
        }

        public String conditionsString() {
            return conditions.stream().collect(joining(" AND "));
        }
    }
}
