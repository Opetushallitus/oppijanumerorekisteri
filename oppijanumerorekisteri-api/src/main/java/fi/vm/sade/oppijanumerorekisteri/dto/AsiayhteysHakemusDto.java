package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class AsiayhteysHakemusDto {

    @NotNull
    private String hakemusOid;

    @NotNull
    private LocalDate loppupaivamaara;

    public AsiayhteysHakemusDto(String hakemusOid, LocalDate loppupaivamaara) {
        this.hakemusOid = hakemusOid;
        this.loppupaivamaara = loppupaivamaara;
    }

}
