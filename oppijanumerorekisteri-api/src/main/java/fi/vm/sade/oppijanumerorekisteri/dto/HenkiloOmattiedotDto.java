package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HenkiloOmattiedotDto {
    // Default to fi on conversion
    private String asiointikieli = "fi";

    private String kutsumanimi;

    private String sukunimi;
}
