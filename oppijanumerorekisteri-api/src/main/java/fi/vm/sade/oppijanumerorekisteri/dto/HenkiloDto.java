package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Setter;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloDto implements Serializable {
    private static final long serialVersionUID = -8509596443256973893L;

    private String oidHenkilo;

    private String hetu;

    private Set<String> kaikkiHetut;

    private boolean passivoitu;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    private KielisyysDto aidinkieli;

    private KielisyysDto asiointiKieli;

    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private String kasittelijaOid;

    private LocalDate syntymaaika;

    private String sukupuoli;

    private String kotikunta;

    private String oppijanumero;

    private Boolean turvakielto;

    private boolean eiSuomalaistaHetua;

    private boolean yksiloity;

    private boolean yksiloityVTJ;

    private boolean yksilointiYritetty;

    private boolean duplicate;

    private Date created;

    private Date modified;

    private Date vtjsynced;

    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();

    private Set<YksilointiVirheDto> yksilointivirheet = new HashSet<>();

    private Set<String> passinumerot;

    @Deprecated
    public HenkiloTyyppi getHenkiloTyyppi() {
        return HenkiloTyyppi.OPPIJA;
    }

    @Deprecated
    public Set<KielisyysDto> getKielisyys() {
        return new HashSet<>();
    }
}
