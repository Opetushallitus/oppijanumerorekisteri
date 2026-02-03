package fi.vm.sade.oppijanumerorekisteri.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OppijahakuCriteria {
    @Size(min = 3)
    private final String query;
    private final boolean passive;
    @Min(0)
    private final Integer page;
}
