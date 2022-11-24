package fi.vm.sade.oppijanumerorekisteri.configurations;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
@EnableAsync
public class AsyncConfiguration {

    public static final String OPPIJOIDEN_TUONTI_EXECUTOR_QUALIFIER = "oppijoidentuonti";

    @Bean
    @Qualifier(OPPIJOIDEN_TUONTI_EXECUTOR_QUALIFIER)
    public Executor asyncExecutorOppijoidenTuonti() {
        // yksinkertaisuuden vuoksi oppijoiden tuonnit käsitellään yhdessä säikeessä
        return Executors.newSingleThreadExecutor();
    }

}
