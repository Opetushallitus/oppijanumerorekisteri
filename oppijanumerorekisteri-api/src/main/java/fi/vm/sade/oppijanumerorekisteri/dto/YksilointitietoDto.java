package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class YksilointitietoDto {

    private String etunimet;
    private String sukunimi;
    private String kutsumanimi;
    private String sukupuoli;
    private Set<YhteystiedotRyhmaDto> yhteystiedot;

}
