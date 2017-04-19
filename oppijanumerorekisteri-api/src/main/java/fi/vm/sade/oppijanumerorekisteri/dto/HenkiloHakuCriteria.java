package fi.vm.sade.oppijanumerorekisteri.dto;

import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

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
    private HenkiloTyyppi tyyppi;
    private Boolean passivoitu;
    private Boolean duplikaatti;

    // organisaatiocriteria
    private Set<String> organisaatioOids;

}
