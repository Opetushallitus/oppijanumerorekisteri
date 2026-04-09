package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema.AccessTokenRequestBody;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema.AccessTokenResponse;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema.AttachmentResponse;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema.ElectronicMessageRequest;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema.MultichannelMessageRequest;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema.MultichannelSendResponse;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema.SendResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/fakes/suomifi-viestit")
@ConditionalOnProperty(name = "tiedotuspalvelu.testapi.enabled", havingValue = "true")
public class SuomifiViestitFake {
  @PostMapping("/v1/token")
  public ResponseEntity token(@RequestBody AccessTokenRequestBody request) {
    if ("username".equals(request.username()) && "password".equals(request.password())) {
      return ResponseEntity.ok(new AccessTokenResponse("fake-access-token"));
    }

    return ResponseEntity.status(418)
        .body("Olen teepannu ...eikun kutsuit tätä feikkirajapintaa väärin!");
  }

  @PostMapping("/v2/messages/electronic")
  public ResponseEntity sendElectronicMessage(@RequestBody ElectronicMessageRequest request) {
    switch (request.recipient().id()) {
      case "210281-9988": // Nordea Demo
      case "041157-998B": // Hellin Sevillantes
        var uuid = UUID.randomUUID().toString();
        var response = new SendResponse(uuid);
        return ResponseEntity.ok(response);

      case "181064-998C": // Hennakaarina Sevillantes
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("", List.of(new ValidationError("", "MAILBOX_NOT_IN_USE"))));
    }

    return ResponseEntity.status(418)
        .body("Olen teepannu ...eikun kutsuit tätä feikkirajapintaa väärin!");
  }

  @PostMapping("/v2/attachments")
  public ResponseEntity<AttachmentResponse> sendAttachment(
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(new AttachmentResponse(UUID.randomUUID().toString()));
  }

  @PostMapping("/v2/messages")
  public ResponseEntity<MultichannelSendResponse> sendMultichannelMessage(
      @RequestBody MultichannelMessageRequest request) {
    return ResponseEntity.ok(new MultichannelSendResponse(UUID.randomUUID().toString()));
  }

  public record ErrorResponse(String reason, List<ValidationError> validationErrors) {}

  public record ValidationError(String error, String errorCode) {}
}
