package fi.vm.sade.oppijanumerorekisteri.configurations;

import lombok.Getter;
import lombok.Setter;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "aws")
public class AwsConfiguration {
    private String region;
    private HenkiloModifiedTopic henkiloModifiedTopic = new HenkiloModifiedTopic();

    @Getter
    @Setter
    public static class HenkiloModifiedTopic {
        private boolean enabled = false;
        private String topicArn;
    }

    @Bean
    AwsCredentialsProvider getAwsCredentialsProvider() {
        return DefaultCredentialsProvider.create();
    }

    @Bean
    @Autowired
    SnsClient getSnsClient(AwsCredentialsProvider credentialsProvider) {
        return SnsClient
                .builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .build();
    }
}
