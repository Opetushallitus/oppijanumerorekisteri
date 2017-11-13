package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.repositories.Sort.OrderBy;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;
import static java.util.stream.Collectors.toList;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class Sort<T> implements Iterable<OrderBy<T>> {

    private final List<OrderBy<T>> orderBy;

    public static <T> Sort<T> of(OrderBy<T>... orderBy) {
        return new Sort<>(Arrays.stream(orderBy)
                .filter(Objects::nonNull)
                .collect(toList()));
    }

    public static <T> Sort<T> of(Direction direction, T... columns) {
        return new Sort<>(Arrays.stream(columns)
                .filter(Objects::nonNull)
                .map(column -> new OrderBy<>(column, direction))
                .collect(toList()));
    }

    @Override
    public Iterator<OrderBy<T>> iterator() {
        return orderBy.iterator();
    }

    @Getter
    @Setter
    @ToString
    @RequiredArgsConstructor(access = AccessLevel.PRIVATE)
    public static class OrderBy<T> {

        private final T column;
        private final Direction direction;
        private final NullHandling nullHandling;

        public OrderBy(T column) {
            this(column, Direction.ASC);
        }

        public OrderBy(T column, Direction direction) {
            this(column, direction, NullHandling.DEFAULT);
        }

        public static <T> OrderBy<T> ascending(T column) {
            return ascending(column, NullHandling.DEFAULT);
        }

        public static <T> OrderBy<T> ascending(T column, NullHandling nullHandling) {
            return new OrderBy<>(column, Direction.ASC, nullHandling);
        }

        public static <T> OrderBy<T> descending(T column) {
            return descending(column, NullHandling.DEFAULT);
        }

        public static <T> OrderBy<T> descending(T column, NullHandling nullHandling) {
            return new OrderBy<>(column, Direction.DESC, nullHandling);
        }

        public boolean isAscending() {
            return direction.isAscending();
        }

        public boolean isDescending() {
            return direction.isDescending();
        }

    }

    public static enum Direction {
        ASC,
        DESC;

        public boolean isAscending() {
            return ASC.equals(this);
        }

        public boolean isDescending() {
            return DESC.equals(this);
        }
    }

    public static enum NullHandling {
        DEFAULT,
        NULLS_FIRST,
        NULLS_LAST;
    }

}
