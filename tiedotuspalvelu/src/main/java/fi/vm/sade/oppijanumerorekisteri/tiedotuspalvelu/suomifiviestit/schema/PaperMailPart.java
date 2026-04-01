package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.schema;

import java.util.List;

public record PaperMailPart(
    List<AttachmentReference> attachments,
    boolean colorPrinting,
    boolean createAddressPage,
    String messageServiceType,
    PrintingAndEnvelopingService printingAndEnvelopingService,
    NewPaperMailRecipient recipient,
    boolean rotateLandscapePages,
    NewPaperMailSender sender,
    boolean twoSidedPrinting) {}
