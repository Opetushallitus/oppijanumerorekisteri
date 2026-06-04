package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.services.EmailService;
import fi.vm.sade.oppijanumerorekisteri.services.QueueingEmailService.QueuedEmail;
import fi.vm.sade.properties.OphProperties;
import freemarker.template.Configuration;
import freemarker.template.Template;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.util.Set;

import static org.springframework.ui.freemarker.FreeMarkerTemplateUtils.processTemplateIntoString;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final OphProperties urlProperties;
    private final Configuration freemarker;
    private final QueueingEmailService queueingEmailService;

    @Data
    @Builder
    public static class TuontiKasiteltyWithErrors {
        String linkki;
        String subject;
    };

    public void sendTuontiKasiteltyWithErrorsEmail(Set<String> emails) {
        try {
            String subject = "Virkailijan opintopolku: oppijoiden tuonti suoritettu";
            TuontiKasiteltyWithErrors tuontiKasiteltyWithErrors = TuontiKasiteltyWithErrors.builder()
                .linkki(urlProperties.url("henkilo-ui.oppijoidentuonti"))
                .subject(subject)
                .build();

            Template template = freemarker.getTemplate("emails/tuonti_kasitelty_with_errors.ftl");
            QueuedEmail email = QueuedEmail.builder()
                .subject(subject)
                .recipients(emails.stream().toList())
                .body(processTemplateIntoString(template, tuontiKasiteltyWithErrors))
                .build();

            queueingEmailService.queueEmail(email);
        } catch (Exception e) {
            log.error("Error sending tuonti kasitelty with errors", e);
        }
    }
}
