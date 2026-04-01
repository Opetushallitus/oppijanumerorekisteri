package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema;

public record ElectronicMessageRequest(
    ElectronicPart electronic, String externalId, Recipient recipient, Sender sender) {}
