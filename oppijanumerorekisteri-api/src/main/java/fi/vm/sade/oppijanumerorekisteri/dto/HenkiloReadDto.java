package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
public class HenkiloReadDto {

    private Long id;
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
    private Boolean eiSuomalaistaHetua;
    private Boolean passivoitu;
    private Boolean yksiloity;
    private Boolean yksiloityVTJ;
    private Boolean yksiloityEidas;
    private Boolean yksilointiYritetty;
    private Boolean duplicate;
    private Date created;
    private Date modified;
    private Date vtjsynced;
    private String kasittelijaOid;
    private KielisyysReadDto asiointiKieli;
    private KielisyysReadDto aidinkieli;
    private Set<KansalaisuusReadDto> kansalaisuus;
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma;
    private Set<String> passinumerot;

    @Deprecated
    public Set<KielisyysReadDto> getKielisyys() {
        return new HashSet<>();
    }

}
