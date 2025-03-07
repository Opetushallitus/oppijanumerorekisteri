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
    private String slackUrl = "";

    private final Scheduling scheduling = new Scheduling();

    private String rootUserOid = "1.2.246.562.24.00000000001";

    private final VtjMuutosrajapinta vtjMuutosrajapinta = new VtjMuutosrajapinta();

    private final Tasks tasks = new Tasks();

    private final Oauth2 oauth2 = new Oauth2();

    @Getter
    @Setter
    public static class Tasks {
        private final Export export = new Export();
        private final Datantuonti datantuonti = new Datantuonti();
    }

    @Getter
    @Setter
    public static class Export {
        private String bucketName;
        private Boolean copyToLampi = false;
        private String lampiBucketName;
        private String lampiRoleArn;
        private String lampiExternalId;
    }

    @Getter
    @Setter
    public static class Datantuonti {
        private final DatantuontiExport export = new DatantuontiExport();

        @Getter
        @Setter
        public static class DatantuontiExport {
            private String bucketName;
            private String encryptionKeyArn;
        }
    }

    @Getter
    @Setter
    public static class VtjMuutosrajapinta {
        private Boolean perustietoEnabled = false;
        private Boolean muutostietoEnabled = false;
        private Boolean fetchEnabled = true;
        private String baseUrl;
        private String username;
        private String password;
        private String palveluvaylaEnv;
        private String apigwRoleArn;
    }

    @Getter
    @Setter
    public static class Scheduling {
        private Boolean enabled; // default on SchedulingConfiguration.java

        private final Yksilointi yksilointi = new Yksilointi();

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
        public static class DeathCleanup {
            private int hour = 4;
            private int minute = 30;
        }
    }

    @Getter
    @Setter
    public static class Oauth2 {
        private Boolean enabled;
        private String clientId;
        private String clientSecret;
    }
}
