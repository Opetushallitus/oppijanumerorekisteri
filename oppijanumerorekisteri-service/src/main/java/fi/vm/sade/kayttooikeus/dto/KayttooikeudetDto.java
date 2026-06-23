package fi.vm.sade.kayttooikeus.dto;

import java.util.Optional;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KayttooikeudetDto {
    private boolean admin;
    private Optional<Set<String>> oids;

    public static KayttooikeudetDto admin(Set<String> oids) {
        return new KayttooikeudetDto(true, Optional.ofNullable(oids));
    }

    public static KayttooikeudetDto user(Set<String> oids) {
        return new KayttooikeudetDto(false, Optional.of(oids));
    }

}
