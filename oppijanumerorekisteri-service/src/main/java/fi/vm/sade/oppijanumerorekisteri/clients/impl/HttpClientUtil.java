package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import org.springframework.web.client.RestClientException;

import java.io.IOException;

public final class HttpClientUtil {

    private HttpClientUtil() {
    }

    @FunctionalInterface
    public interface IOExceptionThrowingSupplier<T> {

        T get() throws IOException;

    }

    public static <T> T ioExceptionToRestClientException(IOExceptionThrowingSupplier<T> supplier) {
        try {
            return supplier.get();
        } catch (IOException e) {
            throw new RestClientException(e.getMessage(), e);
        }
    }

    public static RuntimeException noContentOrNotFoundException(String url) {
        return new RestClientException(String.format("Osoite %s palautti 204 tai 404", url));
    }

}
