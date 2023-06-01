package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

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
    private String serviceUserOid;
    private String serviceUserName;

}
