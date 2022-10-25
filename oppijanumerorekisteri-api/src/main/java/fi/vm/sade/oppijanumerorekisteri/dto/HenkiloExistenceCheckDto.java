package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import fi.vm.sade.oppijanumerorekisteri.validation.ValidateHetu;
import lombok.AllArgsConstructor;
import lombok.Generated;
import lombok.Getter;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Generated
@Getter
@AllArgsConstructor
public class HenkiloExistenceCheckDto {

    @NotNull(message = "Cannot be empty")
    @ValidateHetu
    private final String hetu;

    @NotNull(message = "Cannot be empty")
    @Pattern(message = "Invalid pattern. Must contain an alphabetic character.", regexp = "(?U)^\\p{Graph}+( \\p{Graph}+)*+$")
    private final String etunimet;

    @NotNull(message = "Cannot be empty")
    @Pattern(message = "Invalid pattern. Must contain an alphabetic character", regexp = "(?U)^\\p{Graph}+$")
    private final String kutsumanimi;

    @NotNull(message = "Cannot be empty")
    @Pattern(message = "Invalid pattern. Must contain an alphabetic character", regexp = "(?U)^\\p{Graph}+( \\p{Graph}+)*+$")
    private final String sukunimi;

    @JsonIgnore
    @AssertTrue(message = "Nick name must be one of the first names")
    public boolean isNicknameOk() {
        if ( etunimet == null || kutsumanimi == null ) {
            return false;
        }
        String nickname = kutsumanimi.toLowerCase();
        List<String> names = Arrays.asList(etunimet.toLowerCase().split("\\s"));
        List<String> splittedNames = names.stream()
                .filter(s -> s.contains("-"))
                .map(s -> Arrays.asList(s.split("-")))
                .flatMap(Collection::stream)
                .collect(Collectors.toList());
        return names.contains(nickname) || splittedNames.contains(nickname);
    }
}
