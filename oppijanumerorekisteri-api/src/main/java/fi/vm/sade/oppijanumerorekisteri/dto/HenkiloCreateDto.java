package fi.vm.sade.oppijanumerorekisteri.dto;

import fi.vm.sade.oppijanumerorekisteri.validation.ValidateAsiointikieli;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.*;
import lombok.Setter;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Generated
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloCreateDto implements Serializable {
    private static final long serialVersionUID = -8509596443256973893L;

    @ValidateHetu
    private String hetu;

    private boolean passivoitu;

    @NotNull @Size(min = 1)
    private String etunimet;

    @NotNull @Size(min = 1)
    private String kutsumanimi;

    @NotNull @Size(min = 1)
    private String sukunimi;

    private KielisyysDto aidinkieli;

    @ValidateAsiointikieli
    private KielisyysDto asiointiKieli;

    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

    private LocalDate syntymaaika;

    private String sukupuoli;

    private String kotikunta;

    private String oppijanumero;

    private Boolean turvakielto;

    private Boolean eiSuomalaistaHetua;

    private Boolean yksiloity;

    private Boolean yksiloityVTJ;

    private Boolean yksilointiYritetty;

    private Boolean duplicate;

    private Date vtjsynced;

    @Valid
    private Set<YhteystiedotRyhmaDto> yhteystiedotRyhma = new HashSet<>();

    private Set<String> passinumerot = new HashSet<>();

}
