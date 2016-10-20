package fi.vm.sade.oppijanumerorekisteri.aspects;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import javax.ws.rs.NotFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {
    // If javax.ws.rs.NotFoundException is thrown respond with 404
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NotFoundException.class)
    public void handleNotFound() {
    }
}
