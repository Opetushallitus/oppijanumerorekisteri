package fi.vm.sade.oppijanumerorekisteri.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class HenkiloYhteystiedotDto {

    private String oidHenkilo;
    private String hetu;
    private String etunimet;
    private String kutsumanimi;
    private String sukunimi;
    private String asiointikieli;
    private List<YhteystiedotRyhmaDto> yhteystiedotRyhma;

}
