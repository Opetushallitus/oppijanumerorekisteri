import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as rds from "aws-cdk-lib/aws-rds"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as elasticloadbalancingv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53_targets from "aws-cdk-lib/aws-route53-targets";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sharedAccount from "./shared-account";
import * as path from "node:path";

class CdkApp extends cdk.App {
  constructor(props: cdk.AppProps) {
    super(props);
    const stackProps = {
      env: {
        account: process.env.CDK_DEPLOY_TARGET_ACCOUNT,
        region: process.env.CDK_DEPLOY_TARGET_REGION,
      },
    };

    new ECSStack(this, sharedAccount.prefix("ECSStack"), stackProps);
    new DatabaseStack(this, sharedAccount.prefix("Database"), stackProps);
    new OppijanumerorekisteriApplicationStack(this, sharedAccount.prefix("OppijanumerorekisteriApplication"), stackProps);
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

  constructor(
      scope: constructs.Construct,
      id: string,
      props: cdk.StackProps
  ) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {vpcName: sharedAccount.VPC_NAME});

    const exportBucket = new s3.Bucket(this, "ExportBucket", {});

    const database = new rds.DatabaseCluster(this, "Database", {
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
      s3ExportBuckets: [exportBucket],
    });

    this.bastion = new ec2.BastionHostLinux(this, "BastionHost", {
      vpc,
      instanceName: sharedAccount.prefix("Bastion"),
    });
    database.connections.allowDefaultPortFrom(this.bastion);
  }
}

class OppijanumerorekisteriApplicationStack extends cdk.Stack {
  constructor(
      scope: constructs.Construct,
      id: string,
      props: cdk.StackProps
  ) {
    super(scope, id, props);
    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {vpcName: sharedAccount.VPC_NAME});

    const logGroup = new logs.LogGroup(this, "AppLogGroup", {
      logGroupName: sharedAccount.prefix("/oppijanumerorekisteri"),
      retention: logs.RetentionDays.INFINITE,
    });

    const dockerImage = new ecr_assets.DockerImageAsset(this, "AppImage", {
      directory: path.join(__dirname, "../../"),
      file: "Dockerfile",
      platform: ecr_assets.Platform.LINUX_ARM64,
      exclude: ['infra/cdk.out'],
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
    const albHostname = `oppijanumerorekisteri.${sharedHostedZone.zoneName}`;

    new route53.ARecord(this, "ALBARecord", {
      zone: sharedHostedZone,
      recordName: albHostname,
      target: route53.RecordTarget.fromAlias(
          new route53_targets.LoadBalancerTarget(alb)
      ),
    });

    new certificatemanager.Certificate(
        this,
        "AlbCertificate",
        {
          domainName: albHostname,
          validation:
              certificatemanager.CertificateValidation.fromDns(sharedHostedZone),
        }
    );
  }
}

const app = new CdkApp({
  defaultStackSynthesizer: new cdk.DefaultStackSynthesizer({
    qualifier: sharedAccount.CDK_QUALIFIER,
  }),
});
app.synth();
