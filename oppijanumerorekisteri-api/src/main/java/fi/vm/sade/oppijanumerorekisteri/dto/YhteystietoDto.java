package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Setter;
import lombok.*;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YhteystietoDto implements Serializable {
    private static final long serialVersionUID = 4785135498967497621L;

    @NotNull
    private YhteystietoTyyppi yhteystietoTyyppi;

    private String yhteystietoArvo;

    @JsonIgnore
    @AssertTrue(message = "Invalid address data")
    public boolean isYhteystietoArvoOk() {
        return yhteystietoTyyppi.validate(yhteystietoArvo);
    }
}
