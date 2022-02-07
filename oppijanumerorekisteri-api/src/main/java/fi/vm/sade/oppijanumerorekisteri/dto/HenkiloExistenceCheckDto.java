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

@Generated
@Getter
@AllArgsConstructor
public class HenkiloExistenceCheckDto {

    @NotNull(message = "Cannot be empty")
    @ValidateHetu
    private final String ssn;

    @NotNull(message = "Cannot be empty")
    @Pattern(message = "Invalid pattern. Must contain an alphabetic character.", regexp = "(?U)^\\p{Graph}+( \\p{Graph}+)*+$")
    private final String firstName;

    @NotNull(message = "Cannot be empty")
    @Pattern(message = "Invalid pattern. Must contain an alphabetic character", regexp = "(?U)^\\p{Graph}+$")
    private final String nickName;

    @NotNull(message = "Cannot be empty")
    @Pattern(message = "Invalid pattern. Must contain an alphabetic character", regexp = "(?U)^\\p{Graph}+( \\p{Graph}+)*+$")
    private final String lastName;

    @JsonIgnore
    @AssertTrue(message = "Nick name must be one of the first names")
    public boolean isNicknameOk() {
        return firstName != null && nickName != null && Arrays.asList(firstName.toLowerCase().split(" ")).contains(nickName.toLowerCase());
    }
}
