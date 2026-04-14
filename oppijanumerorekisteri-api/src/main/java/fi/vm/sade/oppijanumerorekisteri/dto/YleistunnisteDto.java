package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@RequiredArgsConstructor
public class YleistunnisteDto {

    private final String oid;
    private final String oppijanumero;
}
