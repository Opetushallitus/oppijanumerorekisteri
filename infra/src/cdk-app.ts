import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as rds from "aws-cdk-lib/aws-rds"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as elasticloadbalancingv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53_targets from "aws-cdk-lib/aws-route53-targets";
import * as sns from "aws-cdk-lib/aws-sns";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as logs from "aws-cdk-lib/aws-logs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as kms from "aws-cdk-lib/aws-kms";
import * as sharedAccount from "./shared-account";
import * as config from "./config";
import * as path from "node:path";
import {createHealthCheckStacks} from "./health-check";
import {DatabaseBackupToS3} from "./DatabaseBackupToS3";
import {lookupAlarmTopic} from "./shared-account";
import * as datantuonti from "./datantuonti";
import * as alarms from "./alarms";

class CdkApp extends cdk.App {
  constructor(props: cdk.AppProps) {
    super(props);
    const stackProps = {
      env: {
        account: process.env.CDK_DEPLOY_TARGET_ACCOUNT,
        region: process.env.CDK_DEPLOY_TARGET_REGION,
      },
    };

    const ecsStack = new ECSStack(this, sharedAccount.prefix("ECSStack"), stackProps);
    const datantuontiExportStack = new datantuonti.ExportStack(this, sharedAccount.prefix("DatantuontiExport"), stackProps);
    const databaseStack = new DatabaseStack(
        this,
        sharedAccount.prefix("Database"),
        ecsStack.cluster,
        datantuontiExportStack.bucket,
        stackProps
    );

    createHealthCheckStacks(this)

    new OppijanumerorekisteriApplicationStack(this, sharedAccount.prefix("OppijanumerorekisteriApplication"), {
      database: databaseStack.database,
      bastion: databaseStack.bastion,
      exportBucket: databaseStack.exportBucket,
      ecsCluster: ecsStack.cluster,
      datantuontiExportBucket: datantuontiExportStack.bucket,
      datantuontiExportEncryptionKey: datantuontiExportStack.encryptionKey,
      ...stackProps,
    });

    new HenkiloUiApplicationStack(this, sharedAccount.prefix("HenkiloUiApplication"), {
      ...stackProps,
      bastion: databaseStack.bastion,
      ecsCluster: ecsStack.cluster,
    });
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
  readonly exportBucket: s3.Bucket;

  constructor(
      scope: constructs.Construct,
      id: string,
      ecsCluster: ecs.Cluster,
      datantuontiExportBucket: s3.Bucket,
      props: cdk.StackProps
  ) {
    super(scope, id, props);
    const alarmTopic = lookupAlarmTopic(this, "AlarmTopic")

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {vpcName: sharedAccount.VPC_NAME});

    this.exportBucket = new s3.Bucket(this, "ExportBucket", {});

    if (config.getEnvironment() == "hahtuva" || config.getEnvironment() == "dev") {
      this.database = new rds.DatabaseCluster(this, "Database", {
        vpc,
        vpcSubnets: {subnetType: ec2.SubnetType.PRIVATE_ISOLATED},
        defaultDatabaseName: "oppijanumerorekisteri",
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_12_19,
        }),
        credentials: rds.Credentials.fromGeneratedSecret("oppijanumerorekisteri", {
          secretName: sharedAccount.prefix("DatabaseSecret"),
        }),
        storageType: rds.DBClusterStorageType.AURORA,
        writer: rds.ClusterInstance.provisioned("writer", {
          enablePerformanceInsights: true,
          instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.R6G,
              ec2.InstanceSize.XLARGE
          ),
        }),
        readers: [],
        s3ExportBuckets: [this.exportBucket, datantuontiExportBucket],
      });
    } else {
      this.database = new rds.DatabaseCluster(this, "Database", {
        vpc,
        vpcSubnets: {subnetType: ec2.SubnetType.PRIVATE_ISOLATED},
        defaultDatabaseName: "oppijanumerorekisteri",
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_12_19,
        }),
        credentials: rds.Credentials.fromGeneratedSecret("oppijanumerorekisteri", {
          secretName: sharedAccount.prefix("DatabaseSecret"),
        }),
        storageType: rds.DBClusterStorageType.AURORA,
        writer: rds.ClusterInstance.provisioned("writer", {
          enablePerformanceInsights: true,
          instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.R6G,
              ec2.InstanceSize.XLARGE
          ),
        }),
        storageEncrypted: true,
        readers: [],
        s3ExportBuckets: [this.exportBucket, datantuontiExportBucket],
      });
    }

    this.bastion = new ec2.BastionHostLinux(this, "BastionHost", {
      vpc,
      instanceName: sharedAccount.prefix("Bastion"),
    });
    this.database.connections.allowDefaultPortFrom(this.bastion);

    const backup = new DatabaseBackupToS3(this, "DatabaseBackupToS3", {
      ecsCluster: ecsCluster,
      dbCluster: this.database,
      dbName: "oppijanumerorekisteri",
      alarmTopic,
    });
    this.database.connections.allowDefaultPortFrom(backup);
  }
}

type OppijanumerorekisteriApplicationStackProperties = cdk.StackProps & {
  database: rds.DatabaseCluster
  ecsCluster: ecs.Cluster
  bastion: ec2.BastionHostLinux
  exportBucket: s3.Bucket
  datantuontiExportBucket: s3.Bucket
  datantuontiExportEncryptionKey: kms.IKey
}

class OppijanumerorekisteriApplicationStack extends cdk.Stack {
  constructor(
      scope: constructs.Construct,
      id: string,
      props: OppijanumerorekisteriApplicationStackProperties,
  ) {
    super(scope, id, props);
    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {vpcName: sharedAccount.VPC_NAME});
    const alarmTopic = lookupAlarmTopic(this, "AlarmTopic");

    const logGroup = new logs.LogGroup(this, "AppLogGroup", {
      logGroupName: sharedAccount.prefix("/oppijanumerorekisteri"),
      retention: logs.RetentionDays.INFINITE,
    });
    this.exportFailureAlarm(logGroup, alarmTopic)
    this.datantuontiExportFailureAlarm(logGroup, alarmTopic)

    const dockerImage = new ecr_assets.DockerImageAsset(this, "AppImage", {
      directory: path.join(__dirname, "../../"),
      file: "Dockerfile",
      platform: ecr_assets.Platform.LINUX_ARM64,
      exclude: ['infra/cdk.out'],
    });

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
        });

    const conf = config.getConfig();
    const appPort = 8080;
    taskDefinition.addContainer("AppContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
      logging: new ecs.AwsLogDriver({ logGroup, streamPrefix: "app" }),
      environment: {
        ENV: config.getEnvironment(),
        postgresql_host: props.database.clusterEndpoint.hostname,
        postgresql_port: props.database.clusterEndpoint.port.toString(),
        postgresql_db: "oppijanumerorekisteri",
        aws_region: this.region,
        export_bucket_name: props.exportBucket.bucketName,
        "oppijanumerorekisteri.tasks.datantuonti.export.enabled": `${conf.features["oppijanumerorekisteri.tasks.datantuonti.export.enabled"]}`,
        "oppijanumerorekisteri.tasks.datantuonti.export.bucket-name": props.datantuontiExportBucket.bucketName,
        "oppijanumerorekisteri.tasks.datantuonti.export.encryption-key-arn": props.datantuontiExportEncryptionKey.keyArn
      },
      secrets: {
        postgresql_username: ecs.Secret.fromSecretsManager(
            props.database.secret!,
            "username"
        ),
        postgresql_password: ecs.Secret.fromSecretsManager(
            props.database.secret!,
            "password"
        ),
        authentication_app_password_to_haku: this.ssmSecret("AuthenticationAppPasswordToHaku"),
        authentication_app_username_to_haku: this.ssmSecret("AuthenticationAppUsernameToHaku"),
        authentication_app_password_to_vtj: this.ssmSecret("AuthenticationAppPasswordToVtj"),
        authentication_app_username_to_vtj: this.ssmSecret("AuthenticationAppUsernameToVtj"),
        authentication_app_password_to_henkilotietomuutos: this.ssmSecret("AuthenticationAppPasswordToHenkilotietomuutos"),
        authentication_app_username_to_henkilotietomuutos: this.ssmSecret("AuthenticationAppUsernameToHenkilotietomuutos"),
        kayttooikeus_password: this.ssmSecret("KayttooikeusPassword"),
        kayttooikeus_username: this.ssmSecret("KayttooikeusUsername"),
        lampi_external_id: this.ssmSecret("LampiExternalId"),
        lampi_role_arn: this.ssmString("LampiRoleArn2"),
        palveluvayla_access_key_id: this.ssmSecret("PalveluvaylaAccessKeyId"),
        palveluvayla_secret_access_key: this.ssmSecret("PalveluvaylaSecretAccessKey"),
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
        vtj_muutosrajapinta_username: this.ssmSecret("VtjMuutosrajapintaUsername"),
        vtj_muutosrajapinta_password: this.ssmSecret("VtjMuutosrajapintaPassword"),
        vtjkysely_truststore_base64: ecs.Secret.fromSecretsManager(
            secretsmanager.Secret.fromSecretNameV2(
                this,
                "VtjkyselyTruststoreBase64",
                "/oppijanumerorekisteri/VtjkyselyTruststoreBase64"
            )
        ),
        vtjkysely_truststore_password: this.ssmSecret("VtjkyselyTruststorePassword"),
        vtjkysely_keystore_base64: ecs.Secret.fromSecretsManager(
            secretsmanager.Secret.fromSecretNameV2(
                this,
                "VtjkyselyKeystoreBase64",
                "/oppijanumerorekisteri/VtjkyselyKeystoreBase64"
            )
        ),
        vtjkysely_keystore_password: this.ssmSecret("VtjkyselyKeystorePassword"),
        vtjkysely_username: this.ssmSecret("VtjkyselyUsername"),
        vtjkysely_password: this.ssmSecret("VtjkyselyPassword"),
        henkilo_modified_sns_topic_arn: this.ssmSecret("HenkiloModifiedSnsTopicArn"),
        opintopolku_cross_account_role: this.ssmString("OpintopolkuCrossAccountRole"),
      },
      portMappings: [
        {
          name: "oppijanumerorekisteri",
          containerPort: appPort,
          appProtocol: ecs.AppProtocol.http,
        },
      ],
    });

    props.exportBucket.grantReadWrite(taskDefinition.taskRole);
    props.datantuontiExportBucket.grantReadWrite(taskDefinition.taskRole);
    props.datantuontiExportEncryptionKey.grantEncrypt(taskDefinition.taskRole);
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [
          ssm.StringParameter.valueFromLookup(
            this,
            "/oppijanumerorekisteri/LampiRoleArn2"
          ),
        ],
      })
    );
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [
          ssm.StringParameter.valueFromLookup(
            this,
            "/oppijanumerorekisteri/OpintopolkuCrossAccountRole"
          ),
        ],
      })
    );
    taskDefinition.addToTaskRolePolicy(
        new iam.PolicyStatement({
          actions: ["sts:AssumeRole"],
          resources: [
            ssm.StringParameter.valueFromLookup(
                this,
                "/oppijanumerorekisteri/PalveluvaylaApigwRoleArn"
            ),
          ],
        })
    );

    const service = new ecs.FargateService(this, "Service", {
      cluster: props.ecsCluster,
      taskDefinition,
      desiredCount: conf.minCapacity,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      healthCheckGracePeriod: cdk.Duration.minutes(5),
    });
    const scaling = service.autoScaleTaskCount({
      minCapacity: conf.minCapacity,
      maxCapacity: conf.maxCapacity,
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
        }
    );

    const sharedHostedZone = route53.HostedZone.fromLookup(
        this,
        "YleiskayttoisetHostedZone",
        {
          domainName: ssm.StringParameter.valueFromLookup(this, "zoneName"),
        }
    );
    const albHostname = `oppijanumerorekisteri.${sharedHostedZone.zoneName}`;

    new route53.ARecord(this, "ALBARecord", {
      zone: sharedHostedZone,
      recordName: albHostname,
      target: route53.RecordTarget.fromAlias(
          new route53_targets.LoadBalancerTarget(alb)
      ),
    });

    const albCertificate = new certificatemanager.Certificate(
        this,
        "AlbCertificate",
        {
          domainName: albHostname,
          validation:
              certificatemanager.CertificateValidation.fromDns(sharedHostedZone),
        }
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
        path: "/oppijanumerorekisteri-service/actuator/health",
        port: appPort.toString(),
      },
    });
  }

  exportFailureAlarm(logGroup: logs.LogGroup, alarmTopic: sns.ITopic) {
    alarms.alarmIfExpectedLogLineIsMissing(
        this,
        "ExportTask",
        logGroup,
        alarmTopic,
        logs.FilterPattern.literal('"Oppijanumerorekisteri export task completed"')
    )
  }

  datantuontiExportFailureAlarm(logGroup: logs.LogGroup, alarmTopic: sns.ITopic) {
    alarms.alarmIfExpectedLogLineIsMissing(
        this,
        "DatantuontiExportTask",
        logGroup,
        alarmTopic,
        logs.FilterPattern.literal('"Oppijanumerorekisteri datantuonti export task completed"')
    )
  }

  ssmString(name: string): ecs.Secret {
    return ecs.Secret.fromSsmParameter(
      ssm.StringParameter.fromStringParameterName(
        this,
        `Param${name}`,
        `/oppijanumerorekisteri/${name}`
      )
    );
  }
  ssmSecret(name: string): ecs.Secret {
    return ecs.Secret.fromSsmParameter(
        ssm.StringParameter.fromSecureStringParameterAttributes(
            this,
            `Param${name}`,
            { parameterName: `/oppijanumerorekisteri/${name}` }
        )
    );
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
    props: HenkiloUiApplicationStackProps
  ) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", { vpcName:  sharedAccount.VPC_NAME });
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
      }
    );

    const appPort = 8080;
    taskDefinition.addContainer("AppContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
      logging: new ecs.AwsLogDriver({ logGroup, streamPrefix: "app" }),
      environment: {
        ENV: config.getEnvironment(),
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
      }
    );

    const sharedHostedZone = route53.HostedZone.fromLookup(
      this,
      "YleiskayttoisetHostedZone",
      {
        domainName: ssm.StringParameter.valueFromLookup(this, "zoneName"),
      }
    );
    const albHostname = `henkilo-ui.${sharedHostedZone.zoneName}`;

    new route53.ARecord(this, "ALBARecord", {
      zone: sharedHostedZone,
      recordName: albHostname,
      target: route53.RecordTarget.fromAlias(
        new route53_targets.LoadBalancerTarget(alb)
      ),
    });

    const albCertificate = new certificatemanager.Certificate(
      this,
      "AlbCertificate",
      {
        domainName: albHostname,
        validation:
          certificatemanager.CertificateValidation.fromDns(sharedHostedZone),
      }
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
