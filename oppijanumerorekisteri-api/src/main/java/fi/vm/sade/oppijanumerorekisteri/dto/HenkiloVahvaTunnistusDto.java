package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloVahvaTunnistusDto {
    @NotNull
    @Size(min = 1)
    private String hetu;

    @NotNull
    @Size(min = 1)
    private String etunimet;

    @NotNull
    @Size(min = 1)
    private String sukunimi;
}
