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

    private LocalDate loppupaivamaara;

    public AsiayhteysHakemusDto(String hakemusOid) {
        this.hakemusOid = hakemusOid;
    }

}
