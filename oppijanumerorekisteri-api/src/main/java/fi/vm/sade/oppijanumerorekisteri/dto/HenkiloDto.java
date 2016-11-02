package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloDto implements Serializable {
    private static final long serialVersionUID = -8509596443256973893L;

    private String oidhenkilo;

    private String hetu;

    private boolean passivoitu;

    private HenkiloTyyppi henkilotyyppi;

    private String etunimet;

    private String kutsumanimi;

    private String sukunimi;

    private KielisyysDto aidinkieli;

    private Set<KielisyysDto> kielisyys = new HashSet<>();

    private Set<KansalaisuusDto> kansalaisuus = new HashSet<>();

}
