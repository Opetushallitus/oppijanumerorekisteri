import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import { PipelineType } from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as constructs from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as sharedAccount from "./shared-account";
import {ROUTE53_HEALTH_CHECK_REGION} from "./health-check";

class CdkAppUtil extends cdk.App {
  constructor(props: cdk.AppProps) {
    super(props);

    const env = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    };
    new ContinousDeploymentStack(
      this,
      sharedAccount.prefix("ContinuousDeploymentStack"),
      {
        env,
      }
    );
  }
}

class ContinousDeploymentStack extends cdk.Stack {
  constructor(scope: constructs.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    (["hahtuva", "dev", "qa", "prod"] as const).forEach(
      (env) =>
        new ContinousDeploymentPipelineStack(
          this,
          sharedAccount.prefix(`${capitalize(env)}ContinuousDeploymentPipeline`),
          env,
          { owner: "Opetushallitus", name: "oppijanumerorekisteri", branch: "master" },
          props
        )
    );
  }
}

type EnvironmentName = "hahtuva" | "dev" | "qa" | "prod";

type Repository = {
  owner: string;
  name: string;
  branch: string;
};

class ContinousDeploymentPipelineStack extends cdk.Stack {
  constructor(
    scope: constructs.Construct,
    id: string,
    env: EnvironmentName,
    repository: Repository,
    props: cdk.StackProps
  ) {
    super(scope, id, props);
    const capitalizedEnv = capitalize(env);

    const pipeline = new codepipeline.Pipeline(
      this,
      `Deploy${capitalizedEnv}Pipeline`,
      {
        pipelineName: sharedAccount.prefix(`Deploy${capitalizedEnv}`),
        pipelineType: PipelineType.V1,
      }
    );
    const tag = {
      hahtuva: repository.branch,
      dev: "green-hahtuva",
      qa: "green-dev",
      prod: "green-qa",
    }[env];

    const connectionArn = ssm.StringParameter
        .fromStringParameterName(this,  "CodeStarConnectionArn", sharedAccount.CODE_STAR_CONNECTION_ARN_PARAMETER_NAME).stringValue
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction =
      new codepipeline_actions.CodeStarConnectionsSourceAction({
        actionName: "Source",
        connectionArn,
        codeBuildCloneOutput: true,
        owner: repository.owner,
        repo: repository.name,
        branch: repository.branch,
        output: sourceOutput,
        triggerOnPush: env == "hahtuva",
      });
    const sourceStage = pipeline.addStage({ stageName: "Source" });
    sourceStage.addAction(sourceAction);

    const deployProject = new codebuild.PipelineProject(
      this,
      `Deploy${capitalizedEnv}Project`,
      {
        projectName: sharedAccount.prefix(`Deploy${capitalizedEnv}`),
        concurrentBuildLimit: 1,
        environment: {
          buildImage: codebuild.LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_3_0,
          computeType: codebuild.ComputeType.SMALL,
          privileged: true,
        },
        environmentVariables: {
          CDK_DEPLOY_TARGET_ACCOUNT: {
            type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
            value: `/env/${env}/account_id`,
          },
          CDK_DEPLOY_TARGET_REGION: {
            type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
            value: `/env/${env}/region`,
          },
          DOCKER_USERNAME: {
            type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
            value: "/docker/username",
          },
          DOCKER_PASSWORD: {
            type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
            value: "/docker/password",
          },
          SLACK_NOTIFICATIONS_CHANNEL_WEBHOOK_URL: {
            type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
            value: `/env/${env}/slack-notifications-channel-webhook`,
          },
          MVN_SETTINGSXML: {
            type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
            value: `/mvn/settingsxml`,
          },
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: "0.2",
          env: {
            "git-credential-helper": "yes",
          },
          phases: {
            pre_build: {
              commands: [
                "sudo yum install -y perl-Digest-SHA", // for shasum command
                `git checkout ${tag}`,
                "echo $MVN_SETTINGSXML > ./settings.xml",
              ],
            },
            build: {
              commands: [
                `./deploy-${env}.sh && ./scripts/ci/tag-green-build-${env}.sh && ./scripts/ci/publish-release-notes-${env}.sh`,
              ],
            },
          },
        }),
      }
    );

    const deploymentTargetAccount = ssm.StringParameter.valueFromLookup(
      this,
      `/env/${env}/account_id`
    );
    const deploymentTargetRegion = ssm.StringParameter.valueFromLookup(
      this,
      `/env/${env}/region`
    );

    const targetRegions = [deploymentTargetRegion, ROUTE53_HEALTH_CHECK_REGION];
    deployProject.role?.attachInlinePolicy(
      new iam.Policy(this, `Deploy${capitalizedEnv}Policy`, {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["sts:AssumeRole"],
            resources: targetRegions.flatMap(targetRegion => [
              `arn:aws:iam::${deploymentTargetAccount}:role/cdk-${sharedAccount.CDK_QUALIFIER}-lookup-role-${deploymentTargetAccount}-${targetRegion}`,
              `arn:aws:iam::${deploymentTargetAccount}:role/cdk-${sharedAccount.CDK_QUALIFIER}-file-publishing-role-${deploymentTargetAccount}-${targetRegion}`,
              `arn:aws:iam::${deploymentTargetAccount}:role/cdk-${sharedAccount.CDK_QUALIFIER}-image-publishing-role-${deploymentTargetAccount}-${targetRegion}`,
              `arn:aws:iam::${deploymentTargetAccount}:role/cdk-${sharedAccount.CDK_QUALIFIER}-deploy-role-${deploymentTargetAccount}-${targetRegion}`,
            ])
          }),
        ],
      })
    );
    const deployAction = new codepipeline_actions.CodeBuildAction({
      actionName: "Deploy",
      input: sourceOutput,
      project: deployProject,
    });
    const deployStage = pipeline.addStage({ stageName: "Deploy" });
    deployStage.addAction(deployAction);
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const app = new CdkAppUtil({
  defaultStackSynthesizer: new cdk.DefaultStackSynthesizer({
    qualifier: sharedAccount.CDK_QUALIFIER,
  }),
});
app.synth();
