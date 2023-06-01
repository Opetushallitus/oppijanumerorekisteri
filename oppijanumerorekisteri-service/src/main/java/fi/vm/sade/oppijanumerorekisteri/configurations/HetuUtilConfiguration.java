package fi.vm.sade.oppijanumerorekisteri.configurations;

import fi.vm.sade.oppijanumerorekisteri.validation.HetuUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class HetuUtilConfiguration implements ApplicationListener<ApplicationReadyEvent> {

    @Value("${oppijanumerorekisteri.allow-fake-ssn:true}")
    private boolean allowFake = HetuUtils.ALLOW_FAKE_DEFAULT;

    @Override
    public void onApplicationEvent(final ApplicationReadyEvent event) {
        HetuUtils.setAllowFake(allowFake);
        log.info("Accept fake SSN: {}", allowFake);
    }
}
