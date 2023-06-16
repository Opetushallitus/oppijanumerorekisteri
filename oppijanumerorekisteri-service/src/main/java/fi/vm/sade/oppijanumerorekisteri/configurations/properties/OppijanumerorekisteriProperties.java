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
    private int henkiloViiteSplitSize = 5000;
    private float etunimiThreshold = 0.85f;
    private float sukunimiThreshold = 0.85f;

    private final Scheduling scheduling = new Scheduling();

    private String rootUserOid = "1.2.246.562.24.00000000001";

    private final VtjMuutosrajapinta vtjMuutosrajapinta = new VtjMuutosrajapinta();

    @Getter
    @Setter
    public static class VtjMuutosrajapinta {
        private Boolean enabled = true;
        private int hour = 4;
        private int minute = 0;
        private String baseUrl = "https://api.hiekkalaatikko.muutostietopalvelu.cloud.dvv.fi";
        private String username = "Z02r0858";
        private String password = "TLn6G36Bi53(x-rrL5UT";
    }

    @Getter
    @Setter
    public static class Scheduling {
        private Boolean enabled; // default on SchedulingConfiguration.java

        private final Yksilointi yksilointi = new Yksilointi();

        private final Vtjsync vtjsync = new Vtjsync();

        private final DeathCleanup deathCleanup = new DeathCleanup();

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
            private Long fixedDelayInMillis = 300000L;
            private Boolean asiayhteysKaytossa = false;
        }

        @Getter
        public static class DeathCleanup {
            private int hour = 4;
            private int minute = 30;
        }
    }
}
