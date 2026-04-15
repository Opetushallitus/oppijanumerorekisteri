package fi.vm.sade.oppijanumerorekisteri.clients.cas;

import lombok.Data;

@Data
public class ApiResponse {
    private final Integer status;
    private final String body;
}
