package fi.vm.sade.oppijanumerorekisteri.dto;

import java.time.LocalDate;
import javax.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AsiayhteysKayttooikeusDto {

    @NotNull
    private LocalDate loppupaivamaara;

    public AsiayhteysKayttooikeusDto(LocalDate loppupaivamaara) {
        this.loppupaivamaara = loppupaivamaara;
    }

}
