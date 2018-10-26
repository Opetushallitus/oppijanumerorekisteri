package fi.vm.sade.oppijanumerorekisteri.repositories.sort;

import com.querydsl.core.types.Expression;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.JPQLQuery;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.Sort;
import fi.vm.sade.oppijanumerorekisteri.repositories.impl.querydsl.QuerydslHelpers;
import java.util.function.Function;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class OppijaTuontiSort {

    private final Sort<Column> sort;

    public OppijaTuontiSort(Sort.Direction direction, Column... columns) {
        this(Sort.of(direction, columns));
    }

    public <T> JPQLQuery<T> apply(JPQLQuery<T> query, QHenkilo qHenkilo) {
        sort.forEach(orderBy -> {
            OrderSpecifier<? extends Comparable> orderSpecifier = QuerydslHelpers
                    .toOrderSpecifier(orderBy, orderBy.getColumn().expression.apply(qHenkilo));
            query.orderBy(orderSpecifier);
        });
        return query;
    }

    @RequiredArgsConstructor
    public enum Column {
        CREATED(t -> t.created),
        MODIFIED(t -> t.modified),
        SUKUNIMI(t -> t.sukunimi),
        ETUNIMET(t -> t.etunimet),
        KUTSUMANIMI(t -> t.kutsumanimi),
        ID(t -> t.id),
        ;

        private final Function<QHenkilo, Expression<? extends Comparable>> expression;
    }

}
