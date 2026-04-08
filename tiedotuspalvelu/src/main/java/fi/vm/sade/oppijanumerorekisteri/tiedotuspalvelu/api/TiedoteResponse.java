package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public record TiedoteResponse(
    @Schema(example = "ecd8b9b1-4876-4cb8-8f29-0760eeb2ed8a") UUID id,
    @Schema(example = "1.2.246.562.24.73833272757") String oppijanumero,
    @Schema(example = "1.2.246.562.15.44316860822") Optional<String> opiskeluoikeusOid,
    Meta meta,
    List<StatusEntry> statuses) {}
