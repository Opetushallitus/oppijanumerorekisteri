package fi.vm.sade.oppijanumerorekisteri.configurations.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "oppijanumerorekisteri")
public class OppijanumerorekisteriProperties {
    private int henkiloViiteSplitSize;
    private float etunimiThreshold = 0.85f;
    private float sukunimiThreshold = 0.85f;

    private final Scheduling scheduling = new Scheduling();

    @Getter
    @Setter
    public static class Scheduling {
        private Boolean enabled = true;

        private final Yksilointi yksilointi = new Yksilointi();

        private final Vtjsync vtjsync = new Vtjsync();

        @Getter
        @Setter
        public static class Yksilointi {
            private Boolean enabled = true;
            private Long batchSize = 300L;
            private Long vtjRequestDelayInMillis = 200L;
            private Long fixedDelayInMillis = 900000L;
        }

        @Getter
        @Setter
        public static class Vtjsync {
            private Boolean enabled = true;
            private Long fixedDelayInMillis = 200L;
        }
    }
}
