package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;

@Configuration
public class AwsConfiguration {
  public static final String QUALIFIER = "tiedotuspalvelu";

  @Bean
  @Qualifier(QUALIFIER)
  AwsCredentialsProvider tiedotuspalveluCredentialsProvider() {
    return DefaultCredentialsProvider.create();
  }
}
