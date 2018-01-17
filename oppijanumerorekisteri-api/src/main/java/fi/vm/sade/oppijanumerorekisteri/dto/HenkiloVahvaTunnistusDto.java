package fi.vm.sade.oppijanumerorekisteri.dto;

import static java.util.Objects.requireNonNull;
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

    private String tyosahkopostiosoite;

    public HenkiloVahvaTunnistusDto(String hetu) {
        this.hetu = requireNonNull(hetu);
    }

    @Deprecated
    public HenkiloVahvaTunnistusDto(String hetu, String etunimet, String sukunimi) {
        this(hetu);
    }

}
