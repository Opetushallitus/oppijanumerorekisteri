package fi.vm.sade.henkiloui.service.impl;

import fi.vm.sade.henkiloui.client.LokalisointiClient;
import fi.vm.sade.henkiloui.configurations.ExposedResourceMessageBundleSource;
import fi.vm.sade.henkiloui.dto.LokalisointiCriteria;
import fi.vm.sade.henkiloui.dto.LokalisointiDto;
import fi.vm.sade.henkiloui.service.LocalizationService;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;
import static java.util.stream.Collectors.toSet;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LocalizationServiceImpl implements LocalizationService, ApplicationListener<ApplicationReadyEvent> {

    private static final Logger LOGGER = LoggerFactory.getLogger(LocalizationServiceImpl.class);
    private static final String CATEGORY = "henkilo-ui";
    private static final String LOCALE = "fi";

    private final ExposedResourceMessageBundleSource messageSource;
    private final LokalisointiClient lokalisointiClient;
    private final Environment environment;

    @Override
    public void synchronize() {
        LOGGER.info("Käännöksien synkronointi aloitetaan");
        long start = System.currentTimeMillis();

        LokalisointiCriteria criteria = new LokalisointiCriteria();
        criteria.setCategory(CATEGORY);
        criteria.setLocale(LOCALE);
        Set<String> nykyiset = lokalisointiClient.list(criteria)
                .stream()
                .map(LokalisointiDto::getKey)
                .collect(toSet());

        Properties kaannokset = messageSource.getMessages(new Locale(LOCALE));
        LOGGER.info("Käännöksiä löytyi {}kpl (henkilo-ui), {}kpl (lokalisointi-service)", kaannokset.size(), nykyiset.size());

        // lokalisointipalvelu on master-data joten lisätään vain uudet
        Set<LokalisointiDto> uudet = kaannokset.stringPropertyNames().stream()
                .filter(avain -> nykyiset.stream().noneMatch(avain::equals))
                .map(avain -> new LokalisointiDto(CATEGORY, LOCALE, avain, kaannokset.getProperty(avain)))
                .collect(toSet());
        LOGGER.info("Lisätään uudet käännökset lokalisointipalveluun ({}kpl)", uudet.size());
        lokalisointiClient.update(uudet);

        LOGGER.info("Käännöksien synkronointi päättyy, kesto {}ms", System.currentTimeMillis() - start);
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        try {
            if (environment.getProperty("henkiloui.lokalisointi_synkronointi.aktiivinen", Boolean.class, false)) {
                synchronize();
            }
        } catch (Exception ex) {
            LOGGER.error("Käännöksien synkronointi epäonnistui", ex);
        }
    }

}
