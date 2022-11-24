package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

import static java.util.Objects.requireNonNull;

@Getter
@Setter
@ToString
public class AsiayhteysCriteria {

    private LocalDate loppupaivamaara;
    private Boolean asiayhteysKaytossa;

    public AsiayhteysCriteria(LocalDate loppupaivamaara) {
        this.loppupaivamaara = requireNonNull(loppupaivamaara);
    }

}
