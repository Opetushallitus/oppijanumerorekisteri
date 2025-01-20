package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
public class HenkiloYhteystietoDto {

    // henkilön perustiedot
    private String oidHenkilo;
    private String hetu;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;
    private String asiointikieli;
    // yhteystietoryhma
    private Long yhteystietoRyhmaId;
    private String ryhmaKuvaus;
    private String ryhmaAlkuperaTieto;
    private boolean readOnly;
    // yhteystieto
    private YhteystietoTyyppi yhteystietoTyyppi;
    private String yhteystietoArvo;

}
