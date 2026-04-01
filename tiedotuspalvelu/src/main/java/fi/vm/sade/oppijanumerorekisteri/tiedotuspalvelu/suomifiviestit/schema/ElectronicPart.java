package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema;

import java.util.List;
import lombok.Builder;

@Builder
public record ElectronicPart(
    List<AttachmentReference> attachments,
    String body,
    String bodyFormat,
    String messageServiceType,
    MessageNotifications notifications,
    String replyAllowedBy,
    String title,
    String visibility) {}
