package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import lombok.Builder;
import lombok.Singular;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YhteystiedotRyhmaDto implements Serializable {
    private static final long serialVersionUID = 7820975061439666995L;

    private Long id;

    /**
     * Koodisto "yhteystietotyypit".
     */
    private String ryhmaKuvaus;

    /**
     * Koodisto "yhteystietojenalkupera".
     */
    private String ryhmaAlkuperaTieto;

    private boolean readOnly;

    @Singular(value = "yhteystieto")
    private Set<YhteystietoDto> yhteystieto = new HashSet<>();

}
