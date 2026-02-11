import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as rds from "aws-cdk-lib/aws-rds";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as elasticloadbalancingv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53_targets from "aws-cdk-lib/aws-route53-targets";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sns_subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as logs from "aws-cdk-lib/aws-logs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as kms from "aws-cdk-lib/aws-kms";
import * as sharedAccount from "./shared-account";
import { prefix } from "./shared-account";
import { AutoScalingLimits, getConfig, getEnvironment } from "./config";
import * as path from "node:path";
import { createHealthCheckStacks } from "./health-check";
import { DatabaseBackupToS3 } from "./DatabaseBackupToS3";
import * as datantuonti from "./datantuonti";
import * as alarms from "./alarms";
import { ResponseAlarms } from "./response-alarms";

const config = getConfig();

class CdkApp extends cdk.App {
  constructor(props: cdk.AppProps) {
    super(props);
    const stackProps = {
      env: {
        account: process.env.CDK_DEPLOY_TARGET_ACCOUNT,
        region: process.env.CDK_DEPLOY_TARGET_REGION,
      },
    };

    const dnsStack = new DnsStack(this, prefix("DnsStack"), stackProps);
    const { alarmsToSlackLambda, alarmTopic } = new AlarmStack(
      this,
      sharedAccount.prefix("AlarmStack"),
      stackProps,
    );
    const ecsStack = new ECSStack(
      this,
      sharedAccount.prefix("ECSStack"),
      stackProps,
    );
    const datantuontiExportStack = new datantuonti.ExportStack(
      this,
      sharedAccount.prefix("DatantuontiExport"),
      stackProps,
    );
    const databaseStack = new DatabaseStack(
      this,
      sharedAccount.prefix("Database"),
      ecsStack.cluster,
      datantuontiExportStack.bucket,
      { ...stackProps, alarmTopic },
    );

    createHealthCheckStacks(this, alarmsToSlackLambda, [
      {
        name: "Oppijanumerorekisteri",
        url: new URL(
          `https://${config.virkailijaHost}/oppijanumerorekisteri-service/actuator/health`,
        ),
      },
      {
        name: "Tiedotuspalvelu",
        url: new URL(
          `https://${config.opintopolkuHost}/omat-viestit/actuator/health`,
        ),
      },
    ]);

    new OppijanumerorekisteriApplicationStack(
      this,
      sharedAccount.prefix("OppijanumerorekisteriApplication"),
      {
        alarmTopic,
        database: databaseStack.database,
        bastion: databaseStack.bastion,
        exportBucket: databaseStack.exportBucket,
        ecsCluster: ecsStack.cluster,
        datantuontiExportBucket: datantuontiExportStack.bucket,
        datantuontiExportEncryptionKey: datantuontiExportStack.encryptionKey,
        oauthHostedZone: dnsStack.oppijanumerorekisteriHostedZone,
        ...stackProps,
      },
    );

    new TiedotuspalveluStack(this, sharedAccount.prefix("Tiedotuspalvelu"), {
      ...stackProps,
      database: databaseStack.tiedotuspalveluDatabase,
      ecsCluster: ecsStack.cluster,
      hostedZone: dnsStack.tiedotuspalveluHostedZone,
    });

    new HenkiloUiApplicationStack(
      this,
      sharedAccount.prefix("HenkiloUiApplication"),
      {
        ...stackProps,
        bastion: databaseStack.bastion,
        ecsCluster: ecsStack.cluster,
      },
    );
  }
}

class DnsStack extends cdk.Stack {
  readonly oppijanumerorekisteriHostedZone: route53.IHostedZone;
  readonly tiedotuspalveluHostedZone: route53.IHostedZone;
  constructor(scope: constructs.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    this.oppijanumerorekisteriHostedZone = new route53.HostedZone(
      this,
      "HostedZone",
      {
        zoneName: config.oauthDomainName,
      },
    );
    this.tiedotuspalveluHostedZone = new route53.HostedZone(
      this,
      "TiedotuspalveluHostedZone",
      {
        zoneName: config.tiedotuspalveluDomain,
      },
    );
  }
}

class AlarmStack extends cdk.Stack {
  readonly alarmTopic: sns.ITopic;
  readonly alarmsToSlackLambda: lambda.IFunction;
  constructor(scope: constructs.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    this.alarmsToSlackLambda = this.createAlarmsToSlackLambda();
    this.alarmTopic = this.createAlarmTopic();

    this.alarmTopic.addSubscription(
      new sns_subscriptions.LambdaSubscription(this.alarmsToSlackLambda),
    );

    const pagerDutyIntegrationUrlSecret =
      secretsmanager.Secret.fromSecretNameV2(
        this,
        "PagerDutyIntegrationUrlSecret",
        "/oppijanumero/PagerDutyIntegrationUrl",
      );

    this.alarmTopic.addSubscription(
      new sns_subscriptions.UrlSubscription(
        pagerDutyIntegrationUrlSecret.secretValue.toString(),
        { protocol: sns.SubscriptionProtocol.HTTPS },
      ),
    );

    this.exportValue(this.alarmTopic.topicArn);
  }

  createAlarmTopic() {
    return new sns.Topic(this, "AlarmTopic", {});
  }

  createAlarmsToSlackLambda() {
    const alarmsToSlack = new lambda.Function(this, "AlarmsToSlack", {
      code: lambda.Code.fromAsset("../alarms-to-slack"),
      handler: "alarms-to-slack.handler",
      runtime: new lambda.Runtime("nodejs24.x"),
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(30),
    });

    // https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_lambda.html
    const parametersAndSecretsExtension =
      lambda.LayerVersion.fromLayerVersionArn(
        this,
        "ParametersAndSecretsLambdaExtension",
        "arn:aws:lambda:eu-west-1:015030872274:layer:AWS-Parameters-and-Secrets-Lambda-Extension-Arm64:11",
      );

    alarmsToSlack.addLayers(parametersAndSecretsExtension);
    secretsmanager.Secret.fromSecretNameV2(
      this,
      "slack-webhook",
      "slack-webhook",
    ).grantRead(alarmsToSlack);

    return alarmsToSlack;
  }
}

class ECSStack extends cdk.Stack {
  public cluster: ecs.Cluster;

  constructor(scope: constructs.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    this.cluster = new ecs.Cluster(this, "Cluster", {
      vpc: ec2.Vpc.fromLookup(this, "Vpc", { vpcName: sharedAccount.VPC_NAME }),
      clusterName: sharedAccount.prefix(""),
    });
  }
}

class DatabaseStack extends cdk.Stack {
  readonly bastion: ec2.BastionHostLinux;
  readonly database: rds.DatabaseCluster;
  readonly tiedotuspalveluDatabase: rds.DatabaseCluster;
  readonly exportBucket: s3.Bucket;

  constructor(
    scope: constructs.Construct,
    id: string,
    ecsCluster: ecs.Cluster,
    datantuontiExportBucket: s3.Bucket,
    props: cdk.StackProps & {
      alarmTopic: sns.ITopic;
    },
  ) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {
      vpcName: sharedAccount.VPC_NAME,
    });

    const datantuontiImportRole = new iam.Role(this, "DatantuontiImport", {
      assumedBy: new iam.ServicePrincipal("rds.amazonaws.com"),
    });
    datantuonti
      .createS3ImporPolicyStatements(this)
      .forEach((statement) => datantuontiImportRole.addToPolicy(statement));

    this.exportBucket = new s3.Bucket(this, "ExportBucket", {});

    if (getEnvironment() == "hahtuva" || getEnvironment() == "dev") {
      this.database = new rds.DatabaseCluster(this, "Database", {
        vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        defaultDatabaseName: "oppijanumerorekisteri",
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_16_4,
        }),
        credentials: rds.Credentials.fromGeneratedSecret(
          "oppijanumerorekisteri",
          {
            secretName: sharedAccount.prefix("DatabaseSecret"),
          },
        ),
        storageType: rds.DBClusterStorageType.AURORA,
        writer: rds.ClusterInstance.provisioned("writer", {
          enablePerformanceInsights: true,
          instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.R6G,
            ec2.InstanceSize.XLARGE,
          ),
        }),
        readers: [],
        s3ExportBuckets: [this.exportBucket, datantuontiExportBucket],
        s3ImportRole: datantuontiImportRole,
      });
    } else {
      this.database = new rds.DatabaseCluster(this, "Database", {
        vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        defaultDatabaseName: "oppijanumerorekisteri",
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_12_19,
        }),
        credentials: rds.Credentials.fromGeneratedSecret(
          "oppijanumerorekisteri",
          {
            secretName: sharedAccount.prefix("DatabaseSecret"),
          },
        ),
        storageType: rds.DBClusterStorageType.AURORA,
        writer: rds.ClusterInstance.provisioned("writer", {
          enablePerformanceInsights: true,
          instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.R6G,
            ec2.InstanceSize.XLARGE,
          ),
        }),
        storageEncrypted: true,
        readers: [],
        s3ExportBuckets: [this.exportBucket, datantuontiExportBucket],
        s3ImportRole: datantuontiImportRole,
      });
    }

    this.tiedotuspalveluDatabase = new rds.DatabaseCluster(
      this,
      "TiedotuspalveluDatabase",
      {
        vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        defaultDatabaseName: "tiedotuspalvelu",
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_16_4,
        }),
        credentials: rds.Credentials.fromGeneratedSecret("tiedotuspalvelu", {
          secretName: sharedAccount.prefix("TiedotuspalveluDatabaseSecret"),
        }),
        storageType: rds.DBClusterStorageType.AURORA,
        writer: rds.ClusterInstance.provisioned("writer", {
          enablePerformanceInsights: true,
          instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.T4G,
            ec2.InstanceSize.MEDIUM,
          ),
        }),
        storageEncrypted: true,
        readers: [],
      },
    );

    this.bastion = new ec2.BastionHostLinux(this, "BastionHost", {
      vpc,
      instanceName: sharedAccount.prefix("Bastion"),
    });
    this.database.connections.allowDefaultPortFrom(this.bastion);
    this.tiedotuspalveluDatabase.connections.allowDefaultPortFrom(this.bastion);

    const backup = new DatabaseBackupToS3(this, "DatabaseBackupToS3", {
      ecsCluster: ecsCluster,
      dbCluster: this.database,
      dbName: "oppijanumerorekisteri",
      alarmTopic: props.alarmTopic,
    });
    this.database.connections.allowDefaultPortFrom(backup);
  }
}

type OppijanumerorekisteriApplicationStackProperties = cdk.StackProps & {
  database: rds.DatabaseCluster;
  ecsCluster: ecs.Cluster;
  bastion: ec2.BastionHostLinux;
  exportBucket: s3.Bucket;
  datantuontiExportBucket: s3.Bucket;
  datantuontiExportEncryptionKey: kms.IKey;
  alarmTopic: sns.ITopic;
  oauthHostedZone: route53.IHostedZone;
};

class OppijanumerorekisteriApplicationStack extends cdk.Stack {
  private readonly alarmTopic: sns.ITopic;

  constructor(
    scope: constructs.Construct,
    id: string,
    props: OppijanumerorekisteriApplicationStackProperties,
  ) {
    super(scope, id, props);
    this.alarmTopic = props.alarmTopic;
    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {
      vpcName: sharedAccount.VPC_NAME,
    });

    const logGroup = new logs.LogGroup(this, "AppLogGroup", {
      logGroupName: sharedAccount.prefix("/oppijanumerorekisteri"),
      retention: logs.RetentionDays.INFINITE,
    });
    if (config.lampiExport) {
      this.exportFailureAlarm(logGroup, props.alarmTopic);
    }
    this.datantuontiExportFailureAlarm(logGroup, props.alarmTopic);
    if (
      config.features["oppijanumerorekisteri.tasks.datantuonti.import.enabled"]
    ) {
      this.datantuontiImportFailureAlarm(logGroup, props.alarmTopic);
    }
    if (config.features.vtj) {
      this.vtjKyselyCertificationAlarm(logGroup, props.alarmTopic);
      this.muutostietorajapintaAlarms(logGroup, props.alarmTopic);
    }

    const dockerImage = new ecr_assets.DockerImageAsset(this, "AppImage", {
      directory: path.join(__dirname, "../../"),
      file: "Dockerfile",
      platform: ecr_assets.Platform.LINUX_ARM64,
      exclude: ["infra/cdk.out"],
    });

    new OppijanumerorekisteriService(this, "BatchService", {
      ecsCluster: props.ecsCluster,
      dockerImage,
      autoScaling: config.batchCapacity,
      logGroup,
      streamPrefix: "batch",
      database: props.database,
      datantuontiExportBucket: props.datantuontiExportBucket,
      datantuontiExportEncryptionKey: props.datantuontiExportEncryptionKey,
      exportBucket: props.exportBucket,
      awsRegion: this.region,
    });

    const apiService = new OppijanumerorekisteriService(this, "ApiService", {
      ecsCluster: props.ecsCluster,
      dockerImage,
      autoScaling: config.apiCapacity,
      logGroup,
      streamPrefix: "api",
      database: props.database,
      datantuontiExportBucket: props.datantuontiExportBucket,
      datantuontiExportEncryptionKey: props.datantuontiExportEncryptionKey,
      exportBucket: props.exportBucket,
      awsRegion: this.region,
      extraEnvironment: {
        "db-scheduler.enabled": "false",
      },
    });

    const alb = new elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      "LoadBalancer",
      {
        vpc,
        internetFacing: true,
      },
    );

    const sharedHostedZone = route53.HostedZone.fromLookup(
      this,
      "YleiskayttoisetHostedZone",
      {
        domainName: ssm.StringParameter.valueFromLookup(this, "zoneName"),
      },
    );
    const albHostname = `oppijanumerorekisteri.${sharedHostedZone.zoneName}`;

    new route53.ARecord(this, "ALBARecord", {
      zone: sharedHostedZone,
      recordName: albHostname,
      target: route53.RecordTarget.fromAlias(
        new route53_targets.LoadBalancerTarget(alb),
      ),
    });

    new route53.ARecord(this, "OAuthARecord", {
      zone: props.oauthHostedZone,
      recordName: config.oauthDomainName,
      target: route53.RecordTarget.fromAlias(
        new route53_targets.LoadBalancerTarget(alb),
      ),
    });

    const albCertificate = new certificatemanager.Certificate(
      this,
      "AlbCertificate",
      {
        domainName: albHostname,
        subjectAlternativeNames: [config.oauthDomainName],
        validation: certificatemanager.CertificateValidation.fromDnsMultiZone({
          albHostanme: sharedHostedZone,
          [config.oauthDomainName]: props.oauthHostedZone,
        }),
      },
    );

    const listener = alb.addListener("Listener", {
      protocol: elasticloadbalancingv2.ApplicationProtocol.HTTPS,
      port: 443,
      open: true,
      certificates: [albCertificate],
    });

    const target = listener.addTargets("ServiceTarget", {
      port: apiService.appPort,
      targets: [apiService.service],
      healthCheck: {
        enabled: true,
        interval: cdk.Duration.seconds(10),
        path: apiService.healthCheckPath,
        port: apiService.appPort.toString(),
      },
    });
    new ResponseAlarms(this, "ResponseAlarms", {
      prefix: sharedAccount.prefix(""),
      alarmTopic: this.alarmTopic,
      alb,
      albThreshold: 10,
      target,
      targetThreshold: 6,
    });
  }

  exportFailureAlarm(logGroup: logs.LogGroup, alarmTopic: sns.ITopic) {
    alarms.alarmIfExpectedLogLineIsMissing(
      this,
      sharedAccount.prefix("ExportTask"),
      logGroup,
      alarmTopic,
      logs.FilterPattern.literal(
        '"Oppijanumerorekisteri export task completed"',
      ),
    );
  }

  datantuontiExportFailureAlarm(
    logGroup: logs.LogGroup,
    alarmTopic: sns.ITopic,
  ) {
    alarms.alarmIfExpectedLogLineIsMissing(
      this,
      sharedAccount.prefix("DatantuontiExportTask"),
      logGroup,
      alarmTopic,
      logs.FilterPattern.literal(
        '"Oppijanumerorekisteri datantuonti export task completed"',
      ),
      cdk.Duration.hours(25),
      1,
    );
  }

  datantuontiImportFailureAlarm(
    logGroup: logs.LogGroup,
    alarmTopic: sns.ITopic,
  ) {
    alarms.alarmIfExpectedLogLineIsMissing(
      this,
      "DatantuontiImportTask",
      logGroup,
      alarmTopic,
      logs.FilterPattern.literal(
        '"Oppijanumerorekisteri datantuonti import task completed"',
      ),
      cdk.Duration.hours(25),
      1,
    );
  }

  vtjKyselyCertificationAlarm(logGroup: logs.LogGroup, alarmTopic: sns.ITopic) {
    alarms.alarmIfExpectedLogLineIsMissing(
      this,
      "VtjkyselyCertificationCheckTask",
      logGroup,
      alarmTopic,
      logs.FilterPattern.literal(
        '"VTJKysely certification is valid at least 30 days."',
      ),
      cdk.Duration.hours(25),
      1,
    );
  }

  muutostietorajapintaAlarms(logGroup: logs.LogGroup, alarmTopic: sns.ITopic) {
    alarms.alarmIfExpectedLogLineIsMissing(
      this,
      "VtjMuutostietoIntegration",
      logGroup,
      alarmTopic,
      logs.FilterPattern.literal(
        '"muutostieto processed successfully for henkilo"',
      ),
      cdk.Duration.hours(25),
      1,
    );
    alarms.alarmIfExpectedLogLineIsMissing(
      this,
      "VtjPerustietoIntegration",
      logGroup,
      alarmTopic,
      logs.FilterPattern.literal('"updated with perustieto"'),
      cdk.Duration.hours(25),
      1,
    );
  }
}

class OppijanumerorekisteriService extends constructs.Construct {
  readonly appPort = 8080;
  readonly service: ecs.FargateService;
  readonly healthCheckPath: string =
    "/oppijanumerorekisteri-service/actuator/health";

  constructor(
    scope: constructs.Construct,
    id: string,
    props: {
      ecsCluster: ecs.Cluster;
      dockerImage: ecr_assets.DockerImageAsset;
      autoScaling: AutoScalingLimits;
      logGroup: logs.LogGroup;
      streamPrefix: string;
      database: rds.DatabaseCluster;
      exportBucket: s3.Bucket;
      datantuontiExportBucket: s3.Bucket;
      datantuontiExportEncryptionKey: kms.IKey;
      awsRegion: string;
      extraEnvironment?: ecs.ContainerDefinitionProps["environment"];
    },
  ) {
    super(scope, id);
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        cpu: 1024,
        memoryLimitMiB: 8192,
        runtimePlatform: {
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
          cpuArchitecture: ecs.CpuArchitecture.ARM64,
        },
      },
    );
    const lampiProperties: ecs.ContainerDefinitionProps["environment"] =
      config.lampiExport
        ? {
            "oppijanumerorekisteri.tasks.export.enabled":
              config.lampiExport.enabled.toString(),
            "oppijanumerorekisteri.tasks.export.bucket-name":
              props.exportBucket.bucketName,
            "oppijanumerorekisteri.tasks.export.copy-to-lampi": "true",
            "oppijanumerorekisteri.tasks.export.lampi-bucket-name":
              config.lampiExport.bucketName,
          }
        : {
            "oppijanumerorekisteri.tasks.export.enabled": "false",
          };

    const lampiSecrets: ecs.ContainerDefinitionProps["secrets"] =
      config.lampiExport
        ? {
            "oppijanumerorekisteri.tasks.export.lampi-external-id":
              this.ssmSecret("LampiExternalId"),
            "oppijanumerorekisteri.tasks.export.lampi-role-arn":
              this.ssmString("LampiRoleArn2"),
          }
        : {};

    taskDefinition.addContainer("AppContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(props.dockerImage),
      logging: new ecs.AwsLogDriver({
        logGroup: props.logGroup,
        streamPrefix: props.streamPrefix,
      }),
      environment: {
        ENV: getEnvironment(),
        postgresql_host: props.database.clusterEndpoint.hostname,
        postgresql_port: props.database.clusterEndpoint.port.toString(),
        postgresql_db: "oppijanumerorekisteri",
        aws_region: props.awsRegion,
        export_bucket_name: props.exportBucket.bucketName,
        "oppijanumerorekisteri.tasks.datantuonti.export.enabled": `${config.features["oppijanumerorekisteri.tasks.datantuonti.export.enabled"]}`,
        "oppijanumerorekisteri.tasks.datantuonti.export.bucket-name":
          props.datantuontiExportBucket.bucketName,
        "oppijanumerorekisteri.tasks.datantuonti.export.encryption-key-arn":
          props.datantuontiExportEncryptionKey.keyArn,
        "oppijanumerorekisteri.tasks.datantuonti.import.enabled": `${config.features["oppijanumerorekisteri.tasks.datantuonti.import.enabled"]}`,
        "oppijanumerorekisteri.tasks.testidatantuonti.import.enabled": `${config.features["oppijanumerorekisteri.tasks.testidatantuonti.import.enabled"]}`,
        ...lampiProperties,
        ...props.extraEnvironment,
      },
      secrets: {
        postgresql_username: ecs.Secret.fromSecretsManager(
          props.database.secret!,
          "username",
        ),
        postgresql_password: ecs.Secret.fromSecretsManager(
          props.database.secret!,
          "password",
        ),
        authentication_app_password_to_haku: this.ssmSecret(
          "AuthenticationAppPasswordToHaku",
        ),
        authentication_app_username_to_haku: this.ssmSecret(
          "AuthenticationAppUsernameToHaku",
        ),
        authentication_app_password_to_vtj: this.ssmSecret(
          "AuthenticationAppPasswordToVtj",
        ),
        authentication_app_username_to_vtj: this.ssmSecret(
          "AuthenticationAppUsernameToVtj",
        ),
        authentication_app_password_to_henkilotietomuutos: this.ssmSecret(
          "AuthenticationAppPasswordToHenkilotietomuutos",
        ),
        authentication_app_username_to_henkilotietomuutos: this.ssmSecret(
          "AuthenticationAppUsernameToHenkilotietomuutos",
        ),
        kayttooikeus_password: this.ssmSecret("KayttooikeusPassword"),
        kayttooikeus_username: this.ssmSecret("KayttooikeusUsername"),
        ...lampiSecrets,
        palveluvayla_access_key_id: this.ssmSecret("PalveluvaylaAccessKeyId"),
        palveluvayla_secret_access_key: this.ssmSecret(
          "PalveluvaylaSecretAccessKey",
        ),
        viestinta_username: this.ssmSecret("ViestintaUsername"),
        viestinta_password: this.ssmSecret("ViestintaPassword"),
        ataru_username: this.ssmSecret("AtaruUsername"),
        ataru_password: this.ssmSecret("AtaruPassword"),
        oauth2_clientid: this.ssmSecret("Oauth2Clientid"),
        oauth2_clientsecret: this.ssmSecret("Oauth2Clientsecret"),
        host_cas: this.ssmSecret("HostCas"),
        host_virkailija: this.ssmSecret("HostVirkailija"),
        slack_webhook_url: this.ssmSecret("SlackWebhookUrl"),
        palveluvayla_apigw_role_arn: this.ssmSecret("PalveluvaylaApigwRoleArn"),
        vtj_muutosrajapinta_username: this.ssmSecret(
          "VtjMuutosrajapintaUsername",
        ),
        vtj_muutosrajapinta_password: this.ssmSecret(
          "VtjMuutosrajapintaPassword",
        ),
        vtjkysely_truststore_base64: ecs.Secret.fromSecretsManager(
          secretsmanager.Secret.fromSecretNameV2(
            this,
            "VtjkyselyTruststoreBase64",
            "/oppijanumerorekisteri/VtjkyselyTruststoreBase64",
          ),
        ),
        vtjkysely_truststore_password: this.ssmSecret(
          "VtjkyselyTruststorePassword",
        ),
        vtjkysely_keystore_base64: ecs.Secret.fromSecretsManager(
          secretsmanager.Secret.fromSecretNameV2(
            this,
            "VtjkyselyKeystoreBase64",
            "/oppijanumerorekisteri/VtjkyselyKeystoreBase64",
          ),
        ),
        vtjkysely_keystore_password: this.ssmSecret(
          "VtjkyselyKeystorePassword",
        ),
        vtjkysely_username: this.ssmSecret("VtjkyselyUsername"),
        vtjkysely_password: this.ssmSecret("VtjkyselyPassword"),
        henkilo_modified_sns_topic_arn: this.ssmSecret(
          "HenkiloModifiedSnsTopicArn",
        ),
        opintopolku_cross_account_role: this.ssmString(
          "OpintopolkuCrossAccountRole",
        ),
        "oppijanumerorekisteri.tasks.datantuonti.import.bucket-name":
          this.ssmString(
            "oppijanumerorekisteri.tasks.datantuonti.import.bucket-name",
            "",
          ),
      },
      portMappings: [
        {
          name: "oppijanumerorekisteri",
          containerPort: this.appPort,
          appProtocol: ecs.AppProtocol.http,
        },
      ],
    });

    props.exportBucket.grantReadWrite(taskDefinition.taskRole);
    props.datantuontiExportBucket.grantReadWrite(taskDefinition.taskRole);
    props.datantuontiExportEncryptionKey.grantEncryptDecrypt(
      taskDefinition.taskRole,
    );
    datantuonti
      .createS3ImporPolicyStatements(this)
      .forEach((statement) => taskDefinition.addToTaskRolePolicy(statement));
    if (config.lampiExport) {
      taskDefinition.addToTaskRolePolicy(
        new iam.PolicyStatement({
          actions: ["sts:AssumeRole"],
          resources: [
            ssm.StringParameter.valueFromLookup(
              this,
              "/oppijanumerorekisteri/LampiRoleArn2",
            ),
          ],
        }),
      );
    }
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [
          ssm.StringParameter.valueFromLookup(
            this,
            "/oppijanumerorekisteri/OpintopolkuCrossAccountRole",
          ),
        ],
      }),
    );
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [
          ssm.StringParameter.valueFromLookup(
            this,
            "/oppijanumerorekisteri/PalveluvaylaApigwRoleArn",
          ),
        ],
      }),
    );

    this.service = new ecs.FargateService(this, "Service", {
      cluster: props.ecsCluster,
      taskDefinition,
      desiredCount: props.autoScaling.min,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      healthCheckGracePeriod: cdk.Duration.minutes(5),
    });
    const scaling = this.service.autoScaleTaskCount({
      minCapacity: props.autoScaling.min,
      maxCapacity: props.autoScaling.max,
    });

    scaling.scaleOnMetric("ServiceScaling", {
      metric: this.service.metricCpuUtilization(),
      scalingSteps: [
        { upper: 15, change: -1 },
        { lower: 50, change: +1 },
        { lower: 65, change: +2 },
        { lower: 80, change: +3 },
      ],
    });

    this.service.connections.allowToDefaultPort(props.database);
  }

  ssmString(
    name: string,
    prefix: string = "/oppijanumerorekisteri/",
  ): ecs.Secret {
    return ecs.Secret.fromSsmParameter(
      ssm.StringParameter.fromStringParameterName(
        this,
        `Param${name}`,
        `${prefix}${name}`,
      ),
    );
  }

  ssmSecret(name: string): ecs.Secret {
    return ecs.Secret.fromSsmParameter(
      ssm.StringParameter.fromSecureStringParameterAttributes(
        this,
        `Param${name}`,
        { parameterName: `/oppijanumerorekisteri/${name}` },
      ),
    );
  }
}

type TiedotuspalveluStackProps = cdk.StackProps & {
  ecsCluster: ecs.Cluster;
  hostedZone: route53.IHostedZone;
  database: rds.DatabaseCluster;
};

class TiedotuspalveluStack extends cdk.Stack {
  constructor(
    scope: constructs.Construct,
    id: string,
    props: TiedotuspalveluStackProps,
  ) {
    super(scope, id, props);

    const domainForNginxForwarding = `nginx.${config.tiedotuspalveluDomain}`;

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {
      vpcName: sharedAccount.VPC_NAME,
    });

    const logGroup = new logs.LogGroup(this, "AppLogGroup", {
      logGroupName: sharedAccount.prefix("/tiedotuspalvelu"),
      retention: logs.RetentionDays.INFINITE,
    });

    const dockerImage = new ecr_assets.DockerImageAsset(this, "AppImage", {
      directory: path.join(__dirname, "../../tiedotuspalvelu"),
      file: "Dockerfile",
      platform: ecr_assets.Platform.LINUX_ARM64,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        cpu: 2048,
        memoryLimitMiB: 5120,
        runtimePlatform: {
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
          cpuArchitecture: ecs.CpuArchitecture.ARM64,
        },
      },
    );

    const appPort = 8080;
    taskDefinition.addContainer("AppContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
      logging: new ecs.AwsLogDriver({ logGroup, streamPrefix: "app" }),
      environment: {
        ENV: getEnvironment(),
        "server.port": appPort.toString(),
        "tiedotuspalvelu.base-url": `https://${config.opintopolkuHost}`,
        "tiedotuspalvelu.opintopolku-host": config.opintopolkuHost,
        "tiedotuspalvelu.fetch-oppija.enabled": `${config.features["tiedotuspalvelu.fetch-oppija.enabled"]}`,
        "tiedotuspalvelu.oauth2.token-url": `https://${getEnvironment()}.otuva.opintopolku.fi/kayttooikeus-service/oauth2/token`,
        "spring.security.oauth2.resourceserver.jwt.issuer-uri": `https://${getEnvironment()}.otuva.opintopolku.fi/kayttooikeus-service`,
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri": `https://${getEnvironment()}.otuva.opintopolku.fi/kayttooikeus-service/oauth2/jwks`,
        "spring.datasource.url": `jdbc:postgresql://${props.database.clusterEndpoint.hostname}:${props.database.clusterEndpoint.port}/tiedotuspalvelu`,
      },
      secrets: {
        "tiedotuspalvelu.oauth2.client-id": ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(
            this,
            "TiedotuspalveluOauth2ClientId",
            { parameterName: "/tiedotuspalvelu/oauth2/client-id" },
          ),
        ),
        "tiedotuspalvelu.oauth2.client-secret": ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(
            this,
            "TiedotuspalveluOauth2ClientSecret",
            { parameterName: "/tiedotuspalvelu/oauth2/client-secret" },
          ),
        ),
        "spring.datasource.username": ecs.Secret.fromSecretsManager(
          props.database.secret!,
          "username",
        ),
        "spring.datasource.password": ecs.Secret.fromSecretsManager(
          props.database.secret!,
          "password",
        ),
      },
      portMappings: [
        {
          name: "app",
          containerPort: appPort,
          appProtocol: ecs.AppProtocol.http,
        },
      ],
    });

    const service = new ecs.FargateService(this, "Service", {
      cluster: props.ecsCluster,
      taskDefinition,
      desiredCount: config.tiedotuspalveluCapacity.min,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      healthCheckGracePeriod: cdk.Duration.minutes(5),
      circuitBreaker: { enable: true },
    });

    const scaling = service.autoScaleTaskCount({
      minCapacity: config.tiedotuspalveluCapacity.min,
      maxCapacity: config.tiedotuspalveluCapacity.max,
    });

    scaling.scaleOnMetric("ServiceScaling", {
      metric: service.metricCpuUtilization(),
      scalingSteps: [
        { upper: 15, change: -1 },
        { lower: 50, change: +1 },
        { lower: 65, change: +2 },
        { lower: 80, change: +3 },
      ],
    });

    service.connections.allowToDefaultPort(props.database);

    const alb = new elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      "LoadBalancer",
      {
        vpc,
        internetFacing: true,
      },
    );

    new route53.ARecord(this, "NginxARecord", {
      zone: props.hostedZone,
      recordName: domainForNginxForwarding,
      target: route53.RecordTarget.fromAlias(
        new route53_targets.LoadBalancerTarget(alb),
      ),
    });

    const nginxCertificate = new certificatemanager.Certificate(
      this,
      "AlbNginxCertificate",
      {
        domainName: domainForNginxForwarding,
        validation: certificatemanager.CertificateValidation.fromDns(
          props.hostedZone,
        ),
      },
    );

    const listener = alb.addListener("Listener", {
      protocol: elasticloadbalancingv2.ApplicationProtocol.HTTPS,
      port: 443,
      open: true,
      certificates: [nginxCertificate],
    });

    listener.addTargets("ServiceTarget", {
      port: appPort,
      targets: [service],
      healthCheck: {
        enabled: true,
        interval: cdk.Duration.seconds(30),
        path: "/omat-viestit/actuator/health",
        port: appPort.toString(),
      },
    });
  }
}

type HenkiloUiApplicationStackProps = cdk.StackProps & {
  bastion: ec2.BastionHostLinux;
  ecsCluster: ecs.Cluster;
};

class HenkiloUiApplicationStack extends cdk.Stack {
  constructor(
    scope: constructs.Construct,
    id: string,
    props: HenkiloUiApplicationStackProps,
  ) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {
      vpcName: sharedAccount.VPC_NAME,
    });
    const logGroup = new logs.LogGroup(this, "AppLogGroup", {
      logGroupName: sharedAccount.prefix("/henkilo-ui"),
      retention: logs.RetentionDays.INFINITE,
    });

    const dockerImage = new ecr_assets.DockerImageAsset(this, "AppImage", {
      directory: path.join(__dirname, "../../henkilo-ui"),
      file: "Dockerfile",
      platform: ecr_assets.Platform.LINUX_ARM64,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        cpu: 2048,
        memoryLimitMiB: 5120,
        runtimePlatform: {
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
          cpuArchitecture: ecs.CpuArchitecture.ARM64,
        },
      },
    );

    const appPort = 8080;
    taskDefinition.addContainer("AppContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
      logging: new ecs.AwsLogDriver({ logGroup, streamPrefix: "app" }),
      environment: {
        ENV: getEnvironment(),
      },
      portMappings: [
        {
          name: "service-provider",
          containerPort: appPort,
          appProtocol: ecs.AppProtocol.http,
        },
      ],
    });

    const service = new ecs.FargateService(this, "Service", {
      cluster: props.ecsCluster,
      taskDefinition,
      desiredCount: 1,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      healthCheckGracePeriod: cdk.Duration.minutes(5),
    });

    const alb = new elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      "LoadBalancer",
      {
        vpc,
        internetFacing: true,
      },
    );

    const sharedHostedZone = route53.HostedZone.fromLookup(
      this,
      "YleiskayttoisetHostedZone",
      {
        domainName: ssm.StringParameter.valueFromLookup(this, "zoneName"),
      },
    );
    const albHostname = `henkilo-ui.${sharedHostedZone.zoneName}`;

    new route53.ARecord(this, "ALBARecord", {
      zone: sharedHostedZone,
      recordName: albHostname,
      target: route53.RecordTarget.fromAlias(
        new route53_targets.LoadBalancerTarget(alb),
      ),
    });

    const albCertificate = new certificatemanager.Certificate(
      this,
      "AlbCertificate",
      {
        domainName: albHostname,
        validation:
          certificatemanager.CertificateValidation.fromDns(sharedHostedZone),
      },
    );

    const listener = alb.addListener("Listener", {
      protocol: elasticloadbalancingv2.ApplicationProtocol.HTTPS,
      port: 443,
      open: true,
      certificates: [albCertificate],
    });

    listener.addTargets("ServiceTarget", {
      port: appPort,
      targets: [service],
      healthCheck: {
        enabled: true,
        interval: cdk.Duration.seconds(10),
        path: "/henkilo-ui/actuator/health",
        port: appPort.toString(),
      },
    });
  }
}

const app = new CdkApp({
  defaultStackSynthesizer: new cdk.DefaultStackSynthesizer({
    qualifier: sharedAccount.CDK_QUALIFIER,
  }),
});
app.synth();
