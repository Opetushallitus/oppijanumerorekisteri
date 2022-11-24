package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

import java.time.LocalDate;

@Data
@Generated
@Getter
@Setter
@ToString
@AllArgsConstructor
public class HenkiloMunicipalDobDto {

    private String oidHenkilo;
    private String hetu;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;
    private LocalDate syntymaaika;
}
