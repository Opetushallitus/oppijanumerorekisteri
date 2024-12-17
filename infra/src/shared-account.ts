import * as constructs from "constructs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as cdk from "aws-cdk-lib";

export const CDK_QUALIFIER = "oppijanro";

export function prefix(name: string): string {
  return `Oppijanumerorekisteri${name}`;
}

export const CODE_STAR_CONNECTION_ARN_PARAMETER_NAME = "code-star-connection-arn";

export const VPC_NAME = "vpc";

export function lookupAlarmTopic(construct: constructs.Construct, id: string): sns.ITopic {
  const stack = cdk.Stack.of(construct);
  return sns.Topic.fromTopicArn(construct, id, `arn:aws:sns:${stack.region}:${stack.account}:alarm`);
}
