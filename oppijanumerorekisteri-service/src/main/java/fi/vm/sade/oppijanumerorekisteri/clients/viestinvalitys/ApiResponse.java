package fi.vm.sade.oppijanumerorekisteri.clients.viestinvalitys;

import lombok.Data;

@Data
public class ApiResponse {
    private final Integer status;
    private final String body;
}
