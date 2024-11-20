import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as rds from "aws-cdk-lib/aws-rds"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as sharedAccount from "./shared-account";

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
  constructor(
      scope: constructs.Construct,
      id: string,
      props: cdk.StackProps
  ) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {vpcName: sharedAccount.VPC_NAME});

    const exportBucket = new s3.Bucket(this, "ExportBucket", {});

    new rds.DatabaseCluster(this, "Database", {
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
  }
}

const app = new CdkApp({
  defaultStackSynthesizer: new cdk.DefaultStackSynthesizer({
    qualifier: sharedAccount.CDK_QUALIFIER,
  }),
});
app.synth();
