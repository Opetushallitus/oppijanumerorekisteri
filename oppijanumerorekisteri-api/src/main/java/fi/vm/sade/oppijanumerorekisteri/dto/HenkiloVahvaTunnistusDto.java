package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import static java.util.Objects.requireNonNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HenkiloVahvaTunnistusDto {

    @NotNull
    @Size(min = 1)
    private String hetu;

    private String tyosahkopostiosoite;

    public HenkiloVahvaTunnistusDto(String hetu) {
        this.hetu = requireNonNull(hetu);
    }

}
