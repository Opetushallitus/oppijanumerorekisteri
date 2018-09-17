package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.RyhmasahkopostiClient;
import fi.vm.sade.oppijanumerorekisteri.services.EmailService;
import fi.vm.sade.properties.OphProperties;
import fi.vm.sade.ryhmasahkoposti.api.dto.EmailData;
import fi.vm.sade.ryhmasahkoposti.api.dto.EmailMessage;
import fi.vm.sade.ryhmasahkoposti.api.dto.EmailRecipient;
import fi.vm.sade.ryhmasahkoposti.api.dto.ReportedRecipientReplacementDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private static final String TUONTI_YKSILOINTI_VIRHE_EMAIL_TEMPLATE_NAME = "tuontivirhe_email";
    private static final String LANGUAGE_CODE = "fi";

    private final RyhmasahkopostiClient ryhmasahkopostiClient;
    private final OphProperties urlProperties;

    @Override
    public void sendTuontiKasiteltyWithErrorsEmail(Set<String> emails) {

        List<EmailRecipient> recipients = emails.stream().map(email -> {
            EmailRecipient recipient = new EmailRecipient();
            recipient.setEmail(email);

            String linkki = urlProperties.url("henkilo-ui.oppijoidentuonti");
            recipient.setRecipientReplacements(Arrays.asList(new ReportedRecipientReplacementDTO("linkki", linkki)));
            return recipient;
        }).collect(Collectors.toList());

        EmailMessage emailMessage = new EmailMessage();
        emailMessage.setTemplateName(TUONTI_YKSILOINTI_VIRHE_EMAIL_TEMPLATE_NAME);
        emailMessage.setLanguageCode(LANGUAGE_CODE);

        EmailData emailData = new EmailData();
        emailData.setRecipient(recipients);
        emailData.setEmail(emailMessage);

        ryhmasahkopostiClient.sendRyhmaSahkoposti(emailData);
    }

}
