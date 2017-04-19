package fi.vm.sade.oppijanumerorekisteri.dto;

import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Henkilöiden hakemiseen käyttöoikeuspalvelusta henkilön organisaatioiden ja
 * niihin liittyvien käyttöoikeuksien perusteella.
 */
@Getter
@Setter
@ToString
public class OrganisaatioCriteria {

    private Boolean passivoitu;
    private Set<String> organisaatioOids;
    private Set<String> kayttoOikeusRyhmaNimet;

}
