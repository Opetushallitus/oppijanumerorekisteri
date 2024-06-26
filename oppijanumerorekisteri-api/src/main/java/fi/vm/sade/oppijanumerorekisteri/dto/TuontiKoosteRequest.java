package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.lang.Nullable;

import jakarta.validation.constraints.Min;

@Getter
@Setter
public class TuontiKoosteRequest {
    @Nullable
    private Long id;
    @Nullable
    private String author;
    @Min(1)
    private int page = 1;
    @Min(1)
    private int pageSize = 20;
    private Direction sort = Direction.DESC;
    private SortField field = SortField.timestamp;

    public Pageable forPage() {
        return PageRequest.of(page - 1, pageSize, sort, field.name(), "id");
    }

    // Enum matching sortable (exposed) fields to ease up bind validation
    @SuppressWarnings("java:S115") // mute sonar warnings for non-conventional naming
    enum SortField {
        id,
        timestamp,
        oid,
        author,
        total,
        successful,
        failures,
        inProgress,
        conflicts
    }
}
