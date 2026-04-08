package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.api;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import io.swagger.v3.oas.annotations.media.Schema;

public record Meta(
    @Schema(example = Tiedote.TYPE_KIELITUTKINTOTODISTUS) String type,
    @Schema(example = Tiedote.STATE_OPPIJAN_VALIDOINTI) String state) {}
