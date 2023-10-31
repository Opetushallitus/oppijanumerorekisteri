package fi.vm.sade.oppijanumerorekisteri.example;

import java.util.Objects;

public class Config {
    public static String virkailijaUrl = env("VIRKAILIJA_URL");
    public static String callerId = env("PALVELUKAYTTAJA_CALLERID");
    public static String palvelukayttajaUsername = env("PALVELUKAYTTAJA_USERNAME");
    public static String palvelukayttajaPassword = env("PALVELUKAYTTAJA_PASSWORD");

    private static String env(String key) {
        return Objects.requireNonNull(System.getenv(key), "Environment variable " + key + " is required");
    }
}
