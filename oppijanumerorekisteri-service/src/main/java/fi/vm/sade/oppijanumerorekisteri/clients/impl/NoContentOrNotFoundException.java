package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import jakarta.annotation.Nullable;
import org.springframework.web.client.RestClientException;

public class NoContentOrNotFoundException extends RestClientException {
    public NoContentOrNotFoundException(String msg) {
       super(msg);
    }

    public NoContentOrNotFoundException(String msg, @Nullable Throwable ex) {
       super(msg, ex);
    }
}
