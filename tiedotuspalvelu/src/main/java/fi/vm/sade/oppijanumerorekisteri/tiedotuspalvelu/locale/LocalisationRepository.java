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

  public List<LocalisationDto> findAllWithFallback() {
    var localisations = jpaRepository.findAll();
    if (!localisations.isEmpty()) {
      return localisations.stream()
          .map(l -> new LocalisationDto(l.getKey(), l.getLocale(), l.getValue()))
          .toList();
    }
    return loadFallbackLocalisations();
  }

  private List<LocalisationDto> loadFallbackLocalisations() {
    try (var is = new ClassPathResource("localisations-fallback.json").getInputStream()) {
      return objectMapper.readValue(is, new TypeReference<>() {});
    } catch (IOException e) {
      throw new UncheckedIOException("Failed to load fallback localisations", e);
    }
  }

  public void deleteAll() {
    jpaRepository.deleteAll();
  }

  public void saveAll(List<Localisation> localisations) {
    jpaRepository.saveAll(localisations);
  }
}
