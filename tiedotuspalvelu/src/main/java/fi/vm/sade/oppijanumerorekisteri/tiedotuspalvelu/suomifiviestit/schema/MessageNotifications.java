package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema;

public record MessageNotifications(
    UnreadMessageNotification unreadMessageNotification, String senderDetailsInNotifications) {}
