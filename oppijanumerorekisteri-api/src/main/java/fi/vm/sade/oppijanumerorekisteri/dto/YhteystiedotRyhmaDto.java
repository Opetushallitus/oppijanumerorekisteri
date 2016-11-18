package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
public class YhteystiedotRyhmaDto implements Serializable {
    private static final long serialVersionUID = 7820975061439666995L;

    private String ryhmaKuvaus;

    private String ryhmaAlkuperaTieto;

    private boolean readOnly;

    private Set<YhteystietoDto> yhteystieto = new HashSet<>();


}
