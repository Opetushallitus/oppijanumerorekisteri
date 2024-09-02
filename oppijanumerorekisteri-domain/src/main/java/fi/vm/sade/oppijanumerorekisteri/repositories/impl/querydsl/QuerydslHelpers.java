package fi.vm.sade.oppijanumerorekisteri.repositories.impl.querydsl;

import com.querydsl.core.types.Expression;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import fi.vm.sade.oppijanumerorekisteri.repositories.Sort;

public final class QuerydslHelpers {

    private QuerydslHelpers() {
    }

    public static <T extends Comparable<?>> OrderSpecifier<T> toOrderSpecifier(Sort.OrderBy<?> orderBy, Expression<T> expression) {
        Order order = toOrder(orderBy.getDirection());
        OrderSpecifier.NullHandling nullHandling = toNullHandling(orderBy.getNullHandling());
        return new OrderSpecifier<>(order, expression, nullHandling);
    }

    public static Order toOrder(Sort.Direction direction) {
        return direction.isAscending() ? Order.ASC : Order.DESC;
    }

    public static OrderSpecifier.NullHandling toNullHandling(Sort.NullHandling nullHandling) {
        switch (nullHandling) {
            case DEFAULT:
                return OrderSpecifier.NullHandling.Default;
            case NULLS_FIRST:
                return OrderSpecifier.NullHandling.NullsFirst;
            case NULLS_LAST:
                return OrderSpecifier.NullHandling.NullsLast;
            default:
                throw new IllegalArgumentException(String.format("Tuntematon nullHandling %s", nullHandling));
        }
    }

}
