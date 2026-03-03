package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
record MultichannelMessageRequest(
    ElectronicPart electronic,
    String externalId,
    PaperMailPart paperMail,
    Recipient recipient,
    Sender sender) {}

record PaperMailPart(
    List<AttachmentReference> attachments,
    boolean colorPrinting,
    boolean createAddressPage,
    String messageServiceType,
    PrintingAndEnvelopingService printingAndEnvelopingService,
    NewPaperMailRecipient recipient,
    boolean rotateLandscapePages,
    NewPaperMailSender sender,
    boolean twoSidedPrinting) {}

record NewPaperMailRecipient(Address address) {}

record NewPaperMailSender(Address address) {}

@JsonInclude(JsonInclude.Include.NON_NULL)
record Address(
    String name,
    String streetAddress,
    String zipCode,
    String city,
    String countryCode,
    String additionalName) {}

record PrintingAndEnvelopingService(PostiMessaging postiMessaging) {}

record PostiMessaging(String username, String password, ContactDetails contactDetails) {}

record ContactDetails(String email) {}
