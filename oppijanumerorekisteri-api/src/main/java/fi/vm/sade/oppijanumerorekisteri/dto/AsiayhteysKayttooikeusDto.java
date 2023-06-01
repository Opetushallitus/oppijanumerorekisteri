package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

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
