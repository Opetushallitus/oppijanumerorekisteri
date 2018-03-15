package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import java.time.LocalDate;
import static java.util.Objects.requireNonNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AsiayhteysCriteria {

    private LocalDate loppupaivamaara;

    public AsiayhteysCriteria(LocalDate loppupaivamaara) {
        this.loppupaivamaara = requireNonNull(loppupaivamaara);
    }

}
