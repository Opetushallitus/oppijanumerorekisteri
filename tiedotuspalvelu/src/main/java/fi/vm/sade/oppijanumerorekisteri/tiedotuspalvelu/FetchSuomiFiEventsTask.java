package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@AllArgsConstructor
public class FetchSuomiFiEventsTask {

  private final SuomiFiViestitClient suomiFiViestitClient;
  private final SuomiFiViestitEventRepository eventRepository;
  private final SuomiFiViestitEventsCursorRepository cursorRepository;
  private final ObjectMapper objectMapper;

  @Transactional
  public void execute() {
    log.info("Running FetchSuomiFiEventsTask");
    var cursor = cursorRepository.findById(true).orElse(null);
    var continuationToken = cursor != null ? cursor.getContinuationToken() : null;

    while (true) {
      var response = suomiFiViestitClient.fetchEvents(continuationToken);

      for (var event : response.events()) {
        var messageId = event.metadata().get("messageId");
        eventRepository.save(
            SuomiFiViestitEvent.builder()
                .eventTime(event.eventTime())
                .eventType(event.type())
                .messageId(messageId != null ? messageId.toString() : null)
                .metadata(serializeMetadata(event.metadata()))
                .build());
      }

      continuationToken = response.continuationToken();
      if (cursor == null) {
        cursor = new SuomiFiViestitEventsCursor(true, continuationToken);
      } else {
        cursor.setContinuationToken(continuationToken);
      }
      cursorRepository.save(cursor);

      if (response.events().isEmpty()) {
        break;
      }
    }
    log.info("Finished running FetchSuomiFiEventsTask");
  }

  private String serializeMetadata(java.util.Map<String, Object> metadata) {
    try {
      return objectMapper.writeValueAsString(metadata);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize event metadata", e);
    }
  }
}
