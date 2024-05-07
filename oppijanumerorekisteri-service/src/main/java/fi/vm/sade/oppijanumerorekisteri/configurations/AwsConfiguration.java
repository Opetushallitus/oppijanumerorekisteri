package fi.vm.sade.oppijanumerorekisteri.configurations;

import lombok.Getter;
import lombok.Setter;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sts.StsClient;

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

    @Bean("opintopolkuCredentialsProvider")
    AwsCredentialsProvider getAwsCredentialsProvider() {
        return DefaultCredentialsProvider.create();
    }

    @Bean
    @Autowired
    StsClient getStsClient(AwsCredentialsProvider opintopolkuCredentialsProvider) {
        return StsClient
                .builder()
                .region(Region.of(region))
                .credentialsProvider(opintopolkuCredentialsProvider)
                .build();
    }

    @Bean
    @Autowired
    SnsClient getSnsClient(AwsCredentialsProvider opintopolkuCredentialsProvider) {
        return SnsClient
                .builder()
                .region(Region.of(region))
                .credentialsProvider(opintopolkuCredentialsProvider)
                .build();
    }

    @Bean
    public S3AsyncClient opintopolkuS3Client(AwsCredentialsProvider opintopolkuCredentialsProvider) {
        return S3AsyncClient.builder()
                .credentialsProvider(opintopolkuCredentialsProvider)
                .region(Region.of(region))
                .build();
    }
}
