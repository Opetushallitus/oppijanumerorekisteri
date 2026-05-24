package fi.vm.sade.oppijanumerorekisteri.services.datantuonti;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

public class TestiHetuRandomizer {
  final String HETU_CHECKSUM_CHARACTERS = "0123456789ABCDEFHJKLMNPRSTUVWXY";
  final Map<String, String> HETU_SEPARATORS =
      Map.of(
          "18", "+",
          "19", "-YXWVU",
          "20", "ABCDEF");

  public TestiHetuRandomizer() {}

  public String generateTestiHetu(SecureRandom random, LocalDate syntymaaika) {
    String datePart = syntymaaika.format(DateTimeFormatter.ofPattern("ddMMyy"));
    String endPart = String.valueOf(random.nextInt(900, 1000));
    return datePart
        + getSeparator(random, syntymaaika)
        + endPart
        + getChecksumCharacter(datePart, endPart);
  }

  private Character getSeparator(SecureRandom random, LocalDate syntymaaika) {
    String key = String.valueOf((int) Math.floor(syntymaaika.getYear() / 100));
    return HETU_SEPARATORS.get(key).charAt(random.nextInt(HETU_SEPARATORS.get(key).length()));
  }

  private Character getChecksumCharacter(String datePart, String endPart) {
    long checkNumber = Long.parseLong(datePart + endPart, 10);
    return HETU_CHECKSUM_CHARACTERS.charAt((int) (checkNumber % HETU_CHECKSUM_CHARACTERS.length()));
  }
}
