package fi.vm.sade.oppijanumerorekisteri.dto;

import java.time.LocalDate;
import java.util.Date;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HenkiloReadDto {

    private Long id;
    private String etunimet;
    private LocalDate syntymaaika;
    private LocalDate kuolinpaiva;
    private String hetu;
    private String kutsumanimi;
    private String oidHenkilo;
    private String oppijanumero;
    private String sukunimi;
    private String sukupuoli;
    private Boolean turvakielto;
    private HenkiloTyyppi henkiloTyyppi;
    private Boolean eiSuomalaistaHetua;
    private Boolean passivoitu;
    private Boolean yksiloity;
    private Boolean yksiloityVTJ;
    private Boolean yksilointiYritetty;
    private Boolean duplicate;
    private Date created;
    private Date modified;
    private Date vtjsynced;
    private String kasittelijaOid;
    private KielisyysReadDto asiointiKieli;
    private KielisyysReadDto aidinkieli;
    private HenkiloReadDto huoltaja;
    private Set<KielisyysReadDto> kielisyys;
    private Set<KansalaisuusReadDto> kansalaisuus;

}
