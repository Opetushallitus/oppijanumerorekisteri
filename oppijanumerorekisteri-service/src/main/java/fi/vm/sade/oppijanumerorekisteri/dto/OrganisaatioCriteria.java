package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import static java.util.stream.Collectors.joining;

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

    public Map<String, Object> getAsMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        if (getPassivoitu() != null) {
            map.put("passivoitu", getPassivoitu());
        }
        if (getOrganisaatioOids() != null) {
            map.put("organisaatioOids", getAsCommaSeparated(getOrganisaatioOids()));
        }
        if (getKayttoOikeusRyhmaNimet() != null) {
            map.put("kayttoOikeusRyhmaNimet", getAsCommaSeparated(getKayttoOikeusRyhmaNimet()));
        }
        return map;
    }

    private String getAsCommaSeparated(Collection<String> collection) {
        return collection.stream().collect(joining(","));
    }

}
