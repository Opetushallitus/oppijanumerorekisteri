package fi.vm.sade.oppijanumerorekisteri.clients.cas;

import lombok.Getter;

@Getter
public class BadRequestException extends RuntimeException {
    private final ApiResponse apiResponse;

    public BadRequestException(ApiResponse apiResponse) {
        super(apiResponse.toString());
        this.apiResponse = apiResponse;
    }
}
