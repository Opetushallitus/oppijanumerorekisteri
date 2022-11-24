package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Set;

/**
 * Henkilöhaku kohdistuu oppijanumerorekisterin lisäksi käyttöoikeuspalveluun.
 * Tämä dto kerää yhteen molempien palveluiden hakuehdot.
 */
@Getter
@Setter
@ToString
public class HenkiloHakuCriteria {

    // henkilocriteria
    private Set<String> henkiloOids;
    private String hetu;
    private Boolean passivoitu;
    private Boolean duplikaatti;

    // organisaatiocriteria
    private Set<String> organisaatioOids;
    private Set<String> kayttoOikeusRyhmaNimet;

}
