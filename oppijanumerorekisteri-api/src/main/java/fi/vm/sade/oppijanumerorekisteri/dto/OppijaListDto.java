package fi.vm.sade.oppijanumerorekisteri.dto;

import java.time.LocalDate;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OppijaListDto {

    private String oid;
    private String oppijanumero;
    private Date luotu;
    private Date muokattu;
    private LocalDate syntymaaika;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;
    private YksilointiTila yksilointiTila;

}
