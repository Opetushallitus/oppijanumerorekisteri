package fi.vm.sade.oppijanumerorekisteri.dto;

import java.util.Date;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OppijaMuutosDto {

    private String oid;
    private String oppijanumero;
    private Date luotu;
    private Date muokattu;
    private String hetu;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma;
    private YksilointiTila yksilointiTila;

}