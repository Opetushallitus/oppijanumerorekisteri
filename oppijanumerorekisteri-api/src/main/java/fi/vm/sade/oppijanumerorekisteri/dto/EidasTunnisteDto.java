package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.*;
import lombok.Setter;

@Builder
@RequiredArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class EidasTunnisteDto {
    private String tunniste;
}
