package fi.vm.sade.oppijanumerorekisteri.services.export;

import fi.vm.sade.oppijanumerorekisteri.configurations.AwsConfiguration;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.auth.StsAssumeRoleCredentialsProvider;
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest;

@Configuration
@RequiredArgsConstructor
public class LampiConfiguration {
    private static final String LAMPI_CREDENTIALS_PROVIDER = "lampiCredentialsProvider";
    private static final Region REGION = Region.EU_WEST_1;

    private final OppijanumerorekisteriProperties properties;

    @Bean(LAMPI_CREDENTIALS_PROVIDER)
    public StsAssumeRoleCredentialsProvider lampiCredentialsProvider(@Qualifier(AwsConfiguration.ONR_CREDENTIALS_PROVIDER) AwsCredentialsProvider onrCredentialsProvider) {
        var lampiRoleArn = properties.getTasks().getExport().getLampiRoleArn();
        var lampiExternalId = properties.getTasks().getExport().getLampiExternalId();
        var stsClient = StsClient.builder()
                .credentialsProvider(onrCredentialsProvider)
                .region(REGION)
                .build();

        return StsAssumeRoleCredentialsProvider.builder()
                .stsClient(stsClient)
                .refreshRequest(() -> AssumeRoleRequest.builder()
                        .roleArn(lampiRoleArn)
                        .externalId(lampiExternalId)
                        .roleSessionName("oppijanumerorekisteri-lampi-export")
                        .build())
                .build();
    }

    @Bean
    public S3AsyncClient lampiS3Client(@Qualifier(LAMPI_CREDENTIALS_PROVIDER) StsAssumeRoleCredentialsProvider lampiCredentialsProvider) {
        return S3AsyncClient.builder()
                .credentialsProvider(lampiCredentialsProvider)
                .region(REGION)
                .build();
    }
}
