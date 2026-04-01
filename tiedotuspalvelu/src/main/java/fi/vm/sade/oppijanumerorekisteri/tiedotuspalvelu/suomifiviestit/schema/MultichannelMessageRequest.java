package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MultichannelMessageRequest(
    ElectronicPart electronic,
    String externalId,
    PaperMailPart paperMail,
    Recipient recipient,
    Sender sender) {}
