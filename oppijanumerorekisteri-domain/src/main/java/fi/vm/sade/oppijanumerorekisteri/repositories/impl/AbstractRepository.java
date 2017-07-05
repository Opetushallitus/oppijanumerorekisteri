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
    
}
