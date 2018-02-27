package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Lähetetään muutostietopalvelulle lisättävien ja poistettavien henkilöiden henkilötunnukset.
 */
@Getter
@Setter
@Builder
public class MuutostietoHetus {

    private List<String> addedHetus;
    private List<String> removedHetus;

}
