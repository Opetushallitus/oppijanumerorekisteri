package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

import java.util.List;

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
    private List<EidasTunnisteDto> eidasTunnisteet;
    private Boolean yksiloity;
    private Boolean passivoitu;
    private Boolean duplicate;
}
