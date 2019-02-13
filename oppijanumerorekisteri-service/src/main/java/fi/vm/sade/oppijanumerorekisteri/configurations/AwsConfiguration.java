package fi.vm.sade.oppijanumerorekisteri.configurations;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import lombok.Getter;
import lombok.Setter;
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
    AWSCredentialsProvider getAwsCredentialsProvider() {
        return DefaultAWSCredentialsProviderChain.getInstance();
    }

    @Bean
    @Autowired
    public AmazonSNS getAmazonSns(AWSCredentialsProvider credentialsProvider) {
        return AmazonSNSClientBuilder.standard()
                .withRegion(region)
                .withCredentials(credentialsProvider)
                .build();
    }
}
