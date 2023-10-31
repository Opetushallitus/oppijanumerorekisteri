package fi.vm.sade.oppijanumerorekisteri.example;


import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.CookieManager;
import java.net.http.HttpClient;

public class Main {
    private static final Logger log = LogManager.getLogger(Main.class);

    public static void main(String[] args) throws InterruptedException {
        log.info("Initializing clients");
        var httpClient = HttpClient.newBuilder().cookieHandler(new CookieManager()).build();
        var casClient = new CasClient(httpClient, Config.virkailijaUrl + "/cas");
        var oppijanumerorekisteriClient = new OppijanumerorekisteriClient(httpClient, casClient);

        while (true) {
            try {
                var request = new OppijanumerorekisteriClient.YleistunnisteHaeRequest(
                        "Magdalena Testi",
                        "010866-9260",
                        "Magdalena",
                        "Sallinen-Testi"
                );
                var response = oppijanumerorekisteriClient.yleistunnisteHae(request);
                log.info("Received a response: {}", response);
            } catch (Exception e) {
                log.error(e);
            }
            Thread.sleep(5_000);
        }
    }
}
