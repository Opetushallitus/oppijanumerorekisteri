package fi.vm.sade.oppijanumerorekisteri.dto;

import java.time.LocalDate;
import javax.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
