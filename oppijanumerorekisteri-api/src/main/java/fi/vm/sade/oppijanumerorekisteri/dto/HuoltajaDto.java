package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
public class HuoltajaDto {
    private String hetu;
    private String oidHenkilo;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;
    private String kotikunta;

    private KielisyysDto aidinkieli;
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();
}
