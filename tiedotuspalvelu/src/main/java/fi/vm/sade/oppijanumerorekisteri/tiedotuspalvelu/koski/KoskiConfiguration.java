package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.koski;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.AwsConfiguration;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.auth.StsAssumeRoleCredentialsProvider;
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest;

@Configuration
public class KoskiConfiguration {
  public static final String QUALIFIER = "koski";
  private static final Region REGION = Region.EU_WEST_1;

  @Value("${tiedotuspalvelu.koski-role-arn}")
  private String koskiRoleArn;

  @Bean
  @Qualifier(QUALIFIER)
  public StsAssumeRoleCredentialsProvider koskiCredentialsProvider(
      @Qualifier(AwsConfiguration.QUALIFIER)
          AwsCredentialsProvider tiedotuspalveluCredentialsProvider) {
    var stsClient =
        StsClient.builder()
            .credentialsProvider(tiedotuspalveluCredentialsProvider)
            .region(REGION)
            .build();

    return StsAssumeRoleCredentialsProvider.builder()
        .stsClient(stsClient)
        .refreshRequest(
            () ->
                AssumeRoleRequest.builder()
                    .roleArn(koskiRoleArn)
                    .roleSessionName("tiedotuspalvelu")
                    .build())
        .build();
  }

  @Bean
  @Qualifier(QUALIFIER)
  public S3AsyncClient koskiS3Client(
      @Qualifier(QUALIFIER) StsAssumeRoleCredentialsProvider koskiCredentialsProvider) {
    return S3AsyncClient.crtBuilder()
        .credentialsProvider(koskiCredentialsProvider)
        .region(REGION)
        .build();
  }
}
