package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Set;

/**
 * Puhdas henkilöhaku
 */
@Getter
@Setter
@ToString
public class HenkiloHakuCriteriaDto {
    private Set<String> henkiloOids;
    private Boolean passivoitu;
    private Boolean duplikaatti;

    private String nameQuery;
}
