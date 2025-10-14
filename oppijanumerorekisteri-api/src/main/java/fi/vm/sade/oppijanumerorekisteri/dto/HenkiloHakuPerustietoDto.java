package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloHakuPerustietoDto {

    private String oidHenkilo;
    private String hetu;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;

    private Boolean yksiloityVTJ;
    private Boolean yksiloityEidas;
    private Boolean yksiloity;
    private Boolean passivoitu;
    private Boolean duplicate;
}
