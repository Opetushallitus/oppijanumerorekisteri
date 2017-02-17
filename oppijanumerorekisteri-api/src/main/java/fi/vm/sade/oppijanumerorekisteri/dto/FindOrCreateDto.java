package fi.vm.sade.oppijanumerorekisteri.dto;

public class FindOrCreateDto<T> {

    private final boolean created;
    private final T dto;

    private FindOrCreateDto(boolean created, T dto) {
        this.created = created;
        this.dto = dto;
    }

    public boolean isCreated() {
        return created;
    }

    public T getDto() {
        return dto;
    }

    public static <T> FindOrCreateDto<T> found(T dto) {
        return new FindOrCreateDto<>(false, dto);
    }

    public static <T> FindOrCreateDto<T> created(T dto) {
        return new FindOrCreateDto<>(true, dto);
    }

}
