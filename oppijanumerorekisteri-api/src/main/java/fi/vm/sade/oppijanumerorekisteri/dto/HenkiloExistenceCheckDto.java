package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Generated;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Generated
@Getter
@SuperBuilder
@AllArgsConstructor
public class HenkiloExistenceCheckDto {

    @ApiModelProperty(required = true)
    @NotEmpty(message = "Cannot be empty")
    @Pattern(message = "Invalid pattern. Must contain an alphabetic character.", regexp = "(?U)^\\p{Graph}+( \\p{Graph}+)*+$")
    private final String etunimet;

    @ApiModelProperty(required = true)
    @NotEmpty(message = "Cannot be empty")
    @Pattern(message = "Invalid pattern. Must contain an alphabetic character", regexp = "(?U)^\\p{Graph}+$")
    private final String kutsumanimi;

    @ApiModelProperty(required = true)
    @NotEmpty(message = "Cannot be empty")
    @Pattern(message = "Invalid pattern. Must contain an alphabetic character", regexp = "(?U)^\\p{Graph}+( \\p{Graph}+)*+$")
    private final String sukunimi;

    @ApiModelProperty(required = true)
    @NotEmpty(message = "Cannot be empty")
    @ValidateHetu
    @Setter
    private String hetu;

    @JsonIgnore
    @AssertTrue(message = "Nick name must be one of the first names")
    public boolean isNicknameOk() {
        if (etunimet == null || kutsumanimi == null) {
            return false;
        }
        String nickname = kutsumanimi.toLowerCase();
        return splitEtunimet(etunimet).contains(nickname);
    }

    @JsonIgnore
    public static List<String> splitEtunimet(String etunimet) {
        List<String> names = Arrays.asList(etunimet.toLowerCase().split("\\s"));
        List<String> splittedNames = names.stream()
                .filter(s -> s.contains("-"))
                .map(s -> Arrays.asList(s.split("-")))
                .flatMap(Collection::stream)
                .collect(Collectors.toList());
        return Stream.concat(names.stream(), splittedNames.stream()).collect(Collectors.toList());
    }
}
