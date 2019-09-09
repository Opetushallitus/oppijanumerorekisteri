package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloForceReadDto {

    private String etunimet;
    private LocalDate syntymaaika;
    private LocalDate kuolinpaiva;
    private String hetu;
    private Set<String> kaikkiHetut;
    private String kutsumanimi;
    private String oidHenkilo;
    private String oppijanumero;
    private String sukunimi;
    private String sukupuoli;
    private String kotikunta;
    private Boolean turvakielto;
    private boolean eiSuomalaistaHetua;
    private boolean passivoitu;
    private boolean yksiloity;
    private boolean yksiloityVTJ;
    private boolean yksilointiYritetty;
    private boolean duplicate;
    private Date created;
    private Date modified;
    private Date vtjsynced;
    private String kasittelijaOid;
    private KielisyysDto asiointiKieli;
    private KielisyysDto aidinkieli;
    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();;
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();;
    private Set<HuoltajaCreateDto> huoltajat = new HashSet<>();;

}
