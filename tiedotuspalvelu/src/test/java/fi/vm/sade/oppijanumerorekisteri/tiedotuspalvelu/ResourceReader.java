package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

public interface ResourceReader {
  public static final String OPPIJANUMERO_HELLIN_SEVILLANTES = "1.2.246.562.98.19783284870";

  default byte[] readBytes(String path) {
    try (var inputStream = getClass().getResourceAsStream(path)) {
      if (inputStream == null) {
        throw new RuntimeException("Resource not found: " + path);
      }
      return inputStream.readAllBytes();
    } catch (Exception e) {
      throw new RuntimeException("Failed to read resource: " + path, e);
    }
  }

  default String readResource(String path) {
    return new String(readBytes(path));
  }
}
