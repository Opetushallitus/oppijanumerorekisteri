package fi.vm.sade.oppijanumerorekisteri.services.datantuonti;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.stream.Stream;

public class DatantuontiHenkiloGenerator {
    final String HETU_CHECKSUM_CHARACTERS = "0123456789ABCDEFHJKLMNPRSTUVWXY";
    final Map<String, String> HETU_SEPARATORS = Map.of(
        "18", "+",
        "19", "-YXWVU",
        "20", "ABCDEF"
    );

    String[] etunimet;
    String[] sukunimet;

    public DatantuontiHenkiloGenerator() {
        try {
            Path etunimetPath = Paths.get(getClass().getClassLoader().getResource("etunimet.txt").toURI());
            Path sukunimetPath = Paths.get(getClass().getClassLoader().getResource("sukunimet.txt").toURI());
            try (Stream<String> etunimetStream = Files.lines(etunimetPath);
                 Stream<String> sukunimetStream = Files.lines(sukunimetPath);) {
                etunimet = etunimetStream.toArray(String[]::new);
                sukunimet = sukunimetStream.toArray(String[]::new);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public GeneratedHenkilo generateHenkilo(boolean yksiloityvtj) {
        var random = new SecureRandom();
        String etunimi = etunimet[random.nextInt(etunimet.length)];
        LocalDate syntymaaika = getRandomDate(random);
        return new GeneratedHenkilo(
            etunimi + " Testi",
            etunimi,
            sukunimet[random.nextInt(sukunimet.length)] + "-Testi",
            yksiloityvtj ? generateTestHetu(random, syntymaaika) : null,
            syntymaaika
        );
    }

    public String generateTestHetu(SecureRandom random, LocalDate syntymaaika) {
        String datePart = syntymaaika.format(DateTimeFormatter.ofPattern("ddMMyy"));
        String endPart = String.valueOf(random.nextInt(900, 1000));
        return datePart + getSeparator(random, syntymaaika) + endPart + getChecksumCharacter(datePart, endPart);
    }

    private Character getSeparator(SecureRandom random, LocalDate syntymaaika) {
        String key = String.valueOf((int)Math.floor(syntymaaika.getYear() / 100));
        return HETU_SEPARATORS.get(key).charAt(random.nextInt(HETU_SEPARATORS.get(key).length()));
    }

    private LocalDate getRandomDate(SecureRandom random) {
        long startEpochDay = LocalDate.now().minusYears(80).toEpochDay();
        long endEpochDay = LocalDate.now().minusYears(7).toEpochDay();
        long randomDay = random.nextLong(startEpochDay, endEpochDay);
        return LocalDate.ofEpochDay(randomDay);
    }

    private Character getChecksumCharacter(String datePart, String endPart) {
        long checkNumber = Long.parseLong(datePart + endPart, 10);
        return HETU_CHECKSUM_CHARACTERS.charAt((int)(checkNumber % HETU_CHECKSUM_CHARACTERS.length()));
    }
}

record GeneratedHenkilo(
    String etunimet,
    String kutsumanimi,
    String sukunimi,
    String hetu,
    LocalDate syntymaaika
) {};