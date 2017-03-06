package fi.vm.sade.oppijanumerorekisteri.dto;

public class FindOrCreateWrapper<T> {

    private final boolean created;
    private final T dto;

    private FindOrCreateWrapper(boolean created, T dto) {
        this.created = created;
        this.dto = dto;
    }

    public boolean isCreated() {
        return created;
    }

    public T getDto() {
        return dto;
    }

    public static <T> FindOrCreateWrapper<T> found(T dto) {
        return new FindOrCreateWrapper<>(false, dto);
    }

    public static <T> FindOrCreateWrapper<T> created(T dto) {
        return new FindOrCreateWrapper<>(true, dto);
    }

}
