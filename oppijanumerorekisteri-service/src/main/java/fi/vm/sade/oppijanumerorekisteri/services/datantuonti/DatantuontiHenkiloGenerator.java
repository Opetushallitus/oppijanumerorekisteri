package fi.vm.sade.oppijanumerorekisteri.services.datantuonti;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.stream.Stream;

public class DatantuontiHenkiloGenerator {
    TestiHetuRandomizer testiHetuRandomizer = new TestiHetuRandomizer();
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
            yksiloityvtj ? testiHetuRandomizer.generateTestiHetu(random, syntymaaika) : null,
            syntymaaika
        );
    }

    private LocalDate getRandomDate(SecureRandom random) {
        long startEpochDay = LocalDate.now().minusYears(80).toEpochDay();
        long endEpochDay = LocalDate.now().minusYears(7).toEpochDay();
        long randomDay = random.nextLong(startEpochDay, endEpochDay);
        return LocalDate.ofEpochDay(randomDay);
    }
}

record GeneratedHenkilo(
    String etunimet,
    String kutsumanimi,
    String sukunimi,
    String hetu,
    LocalDate syntymaaika
) {};