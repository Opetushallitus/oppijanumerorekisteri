package fi.vm.sade.oppijanumerorekisteri.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.Setter;

import java.time.ZonedDateTime;

@Builder
@RequiredArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class EidasTunnisteDto {
    private String tunniste;
}
