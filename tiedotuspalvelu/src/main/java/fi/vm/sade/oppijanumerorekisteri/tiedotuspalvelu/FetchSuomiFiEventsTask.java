package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@Slf4j
@AllArgsConstructor
public class FetchSuomiFiEventsTask {

  private final SuomiFiViestitClient suomiFiViestitClient;
  private final SuomiFiViestitEventRepository eventRepository;
  private final SuomiFiViestitEventsCursorRepository cursorRepository;
  private final ObjectMapper objectMapper;
  private final TransactionTemplate transactionTemplate;

  public void execute() {
    log.info("Running FetchSuomiFiEventsTask");
    var continuationToken =
        transactionTemplate.execute(
            status ->
                cursorRepository
                    .findById(true)
                    .map(SuomiFiViestitEventsCursor::getContinuationToken)
                    .orElse(null));

    while (true) {
      var response = suomiFiViestitClient.fetchEvents(continuationToken);
      var token = response.continuationToken();

      transactionTemplate.executeWithoutResult(
          status -> {
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

            var cursor = cursorRepository.findById(true).orElse(new SuomiFiViestitEventsCursor());
            cursor.setContinuationToken(token);
            cursorRepository.save(cursor);
          });

      continuationToken = token;

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
