package fi.vm.sade.oppijanumerorekisteri.example;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public abstract class CasAuthenticatedServiceClient {
    private final Logger log = LogManager.getLogger(this.getClass());
    protected final HttpClient httpClient;
    private final CasClient casClient;
    protected final String serviceUrl;

    protected CasAuthenticatedServiceClient(HttpClient httpClient, CasClient casClient, String serviceUrl) {
        log.info("Initializing CasAuthenticatedServiceClient for service {}", serviceUrl);
        this.httpClient = httpClient;
        this.casClient = casClient;
        this.serviceUrl = serviceUrl;
    }

    protected HttpResponse<String> sendRequest(HttpRequest.Builder requestBuilder) throws IOException, InterruptedException {
        log.info("Sending CAS authenticated request");
        requestBuilder.timeout(Duration.ofSeconds(10))
                .header("Caller-Id", Config.callerId)
                .header("CSRF", "CSRF")
                .header("Cookie", "CSRF=CSRF");
        var response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());

        if (isLoginToCas(response)) {
            // Oppijanumerorekisteri ohjaa CAS kirjautumissivulle, jos autentikaatiota
            // ei ole tehty. Luodaan uusi CAS ticket ja yritetään uudelleen.
            log.info("Was redirected to CAS login");
            requestBuilder.header(CasClient.CAS_SECURITY_TICKET, fetchCasServiceTicket());
            return httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
        } else if (response.statusCode() == 401) {
            // Oppijanumerorekisteri vastaa HTTP 401 kun sessio on vanhentunut.
            // HUOM! Oppijanumerorekisteri vastaa HTTP 401 myös jos käyttöoikeudet eivät riitä.
            log.info("Received HTTP 401 response");
            requestBuilder.header(CasClient.CAS_SECURITY_TICKET, fetchCasServiceTicket());
            return httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
        } else {
            return response;
        }
    }

    private String fetchCasServiceTicket() {
        log.info("Refreshing CAS ticket");
        return casClient.getTicket(
                Config.palvelukayttajaUsername,
                Config.palvelukayttajaPassword,
                serviceUrl
        );
    }

    private boolean isLoginToCas(HttpResponse<?> response) {
        if (response.statusCode() == 302) {
            var header = response.headers().firstValue("Location");
            return header.map(location -> location.contains("/cas/login")).orElse(false);
        }
        return false;
    }
}
