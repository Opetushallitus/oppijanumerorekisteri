package fi.vm.sade.oppijanumerorekisteri.dto;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OppijahakuResult {
    private final String oid;
    private final String etunimet;
    private final String sukunimi;
    private final LocalDate syntymaaika;
}
