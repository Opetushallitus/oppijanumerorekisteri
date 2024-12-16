package fi.vm.sade.oppijanumerorekisteri.configurations;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
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
import software.amazon.awssdk.services.sts.auth.StsAssumeRoleCredentialsProvider;
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "aws")
public class AwsConfiguration {
    public static final String ONR_CREDENTIALS_PROVIDER = "onrCredentialsProvider";
    public static final String OPINTOPOLKU_CREDENTIALS_PROVIDER = "opintopolkuCredentialsProvider";
    private String region;
    private String opintopolkuRoleArn;
    private HenkiloModifiedTopic henkiloModifiedTopic = new HenkiloModifiedTopic();

    @Getter
    @Setter
    public static class HenkiloModifiedTopic {
        private boolean enabled = false;
        private String topicArn;
    }

    @Bean(ONR_CREDENTIALS_PROVIDER)
    AwsCredentialsProvider onrCredentialsProvider() {
        return DefaultCredentialsProvider.create();
    }

    @Bean
    @Autowired
    StsClient getStsClient(@Qualifier(ONR_CREDENTIALS_PROVIDER) AwsCredentialsProvider onrCredentialsProvider) {
        return StsClient
                .builder()
                .region(Region.of(region))
                .credentialsProvider(onrCredentialsProvider)
                .build();
    }

    @Bean(OPINTOPOLKU_CREDENTIALS_PROVIDER)
    AwsCredentialsProvider opintopolkuCredentialsProvider(@Qualifier(ONR_CREDENTIALS_PROVIDER) AwsCredentialsProvider onrCredentialsProvider) {
        var stsClient = StsClient.builder()
                .credentialsProvider(onrCredentialsProvider)
                .region(Region.of(region))
                .build();

        return StsAssumeRoleCredentialsProvider.builder()
                .stsClient(stsClient)
                .refreshRequest(() -> AssumeRoleRequest.builder()
                        .roleArn(opintopolkuRoleArn)
                        .roleSessionName("onr-henkilo-modified-sns-publish")
                        .build())
                .build();
    }

    @Bean
    @Autowired
    SnsClient opintopolkuSnsClient(@Qualifier(OPINTOPOLKU_CREDENTIALS_PROVIDER) AwsCredentialsProvider opintopolkuCredentialsProvider) {
        return SnsClient
                .builder()
                .region(Region.of(region))
                .credentialsProvider(opintopolkuCredentialsProvider)
                .build();
    }

    @Bean
    public S3AsyncClient onrS3Client(@Qualifier(ONR_CREDENTIALS_PROVIDER) AwsCredentialsProvider onrCredentialsProvider) {
        return S3AsyncClient.crtBuilder()
                .credentialsProvider(onrCredentialsProvider)
                .region(Region.of(region))
                .build();
    }
}
