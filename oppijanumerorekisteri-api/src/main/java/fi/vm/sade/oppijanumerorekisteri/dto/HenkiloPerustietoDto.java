package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Set;

@Getter
@Setter
public class HenkiloPerustietoDto implements Serializable {
    private final static long serialVersionUID = 100L;

    private String oidhenkilo;

    private String hetu;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    private KielisyysDto aidinkieli;

    private Set<KansalaisuusDto> kansalaisuus;

}
