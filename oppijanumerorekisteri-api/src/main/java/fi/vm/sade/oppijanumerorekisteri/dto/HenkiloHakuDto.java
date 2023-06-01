package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
public class HenkiloHakuDto {

    private String oidHenkilo;
    private String hetu;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;

}
