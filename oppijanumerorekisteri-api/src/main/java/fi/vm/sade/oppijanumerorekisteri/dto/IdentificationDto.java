package fi.vm.sade.oppijanumerorekisteri.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import io.swagger.annotations.ApiModelProperty;

public class IdentificationDto {
    @NotNull
    @Valid
    @ApiModelProperty("Koodisto 'henkilontunnistetyypit'")
    private IdpEntityId idpEntityId;

    @NotNull
    @Size(min = 1)
    private String identifier;

    public static IdentificationDto of(IdpEntityId idpEntityId, String identifier) {
        IdentificationDto dto = new IdentificationDto();
        dto.setIdpEntityId(idpEntityId);
        dto.setIdentifier(identifier);
        return dto;
    }

    public IdpEntityId getIdpEntityId() {
        return idpEntityId;
    }

    public void setIdpEntityId(IdpEntityId idpEntityId) {
        this.idpEntityId = idpEntityId;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }
}
