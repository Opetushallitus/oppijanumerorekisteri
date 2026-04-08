package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.Optional;
import lombok.Builder;

@Builder
public record TiedoteDto(
    @Schema(example = "1.2.246.562.24.73833272757") @NotBlank String oppijanumero,
    @Schema(example = "a58d44fb-f970-430b-9b51-5e7bcc6a725b") @NotBlank String idempotencyKey,
    @Schema(example = "koski-tiedotuspalvelu") @JsonProperty("todistusBucket") @NotBlank
        String todistusBucketName,
    @Schema(example = "2d08a8dc-378e-40aa-a3ce-5d987795e619/todistus.pdf")
        @JsonProperty("todistusKey")
        @NotBlank
        String todistusObjectKey,
    @Schema(example = "1.2.246.562.15.44316860822") Optional<String> opiskeluoikeusOid) {}
