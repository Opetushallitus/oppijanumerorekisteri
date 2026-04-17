package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class LocalisationRepository {

  private final LocalisationJpaRepository jpaRepository;
  private final ObjectMapper objectMapper;

  public record LocalisationDto(String key, String locale, String value) {}

  public List<LocalisationDto> findAllByCategoryWithFallback(String category) {
    var fromDb = jpaRepository.findByCategory(category);
    if (!fromDb.isEmpty()) {
      return fromDb.stream()
          .map(l -> new LocalisationDto(l.getKey(), l.getLocale(), l.getValue()))
          .toList();
    }
    return loadFallbackLocalisations(category);
  }

  private List<LocalisationDto> loadFallbackLocalisations(String category) {
    var path = "localisations-fallback-" + category + ".json";
    try (var is = new ClassPathResource(path).getInputStream()) {
      return objectMapper.readValue(is, new TypeReference<>() {});
    } catch (IOException e) {
      throw new UncheckedIOException("Failed to load fallback localisations from " + path, e);
    }
  }

  public String translate(String key, String category, String locale) {
    var all = findAllByCategoryWithFallback(category);
    return all.stream()
        .filter(l -> l.key().equals(key) && l.locale().equals(locale))
        .map(LocalisationDto::value)
        .findFirst()
        .or(
            () ->
                all.stream()
                    .filter(l -> l.key().equals(key) && l.locale().equals("fi"))
                    .map(LocalisationDto::value)
                    .findFirst())
        .orElse(key);
  }

  public void deleteAll() {
    jpaRepository.deleteAll();
  }

  public void saveAll(List<Localisation> localisations) {
    jpaRepository.saveAll(localisations);
  }
}
