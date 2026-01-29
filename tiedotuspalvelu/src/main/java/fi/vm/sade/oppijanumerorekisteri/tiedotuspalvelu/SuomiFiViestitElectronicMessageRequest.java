package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import java.util.List;

record SuomiFiViestitElectronicMessageRequest(
    ElectronicPart electronic, String externalId, Recipient recipient, Sender sender) {}

record ElectronicPart(
    List<AttachmentReference> attachments,
    String body,
    String bodyFormat,
    String messageServiceType,
    MessageNotifications notifications,
    String replyAllowedBy,
    String title,
    String visibility) {}

record AttachmentReference(String attachmentId) {}

record Recipient(String id) {}

record Sender(String serviceId) {}

record MessageNotifications(
    UnreadMessageNotification unreadMessageNotification, String senderDetailsInNotifications) {}

record UnreadMessageNotification(String reminder) {}
