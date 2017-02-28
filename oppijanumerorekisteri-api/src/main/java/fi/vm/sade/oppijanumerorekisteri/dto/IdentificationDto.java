package fi.vm.sade.oppijanumerorekisteri.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class IdentificationDto {

    @NotNull
    @Size(min = 1)
    private String idpEntityId;
    @NotNull
    @Size(min = 1)
    private String identifier;

    public IdentificationDto() {
    }

    public IdentificationDto(String idpEntityId, String identifier) {
        this.idpEntityId = idpEntityId;
        this.identifier = identifier;
    }

    public String getIdpEntityId() {
        return idpEntityId;
    }

    public void setIdpEntityId(String idpEntityId) {
        this.idpEntityId = idpEntityId;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

}
