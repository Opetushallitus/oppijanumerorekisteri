package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class HenkiloDuplicateDto {
    private String oidHenkilo;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;
    private String sukupuoli;
    private String hetu;
    private LocalDate syntymaaika;
    private boolean passivoitu;
    private String email;
    private boolean yksiloity;
    private KielisyysDto aidinkieli;
    private KielisyysDto asiointiKieli;
    private List<Map<String, Object>> hakemukset;
}
