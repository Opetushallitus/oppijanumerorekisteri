package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.*;
import lombok.Setter;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class HenkiloDuplicateDto {
    private String oidHenkilo;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;
    private String sukupuoli;
    private String hetu;
    private Date syntymaaika;
    private String email;
    private boolean yksiloity;
    private List<Map<String, Object>> hakemukset;
}
