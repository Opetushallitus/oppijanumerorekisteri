import * as constructs from "constructs"
import * as cdk from "aws-cdk-lib"
import * as logs from "aws-cdk-lib/aws-logs"
import * as sns from "aws-cdk-lib/aws-sns"
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch"
import * as cloudwatch_actions from "aws-cdk-lib/aws-cloudwatch-actions"

export function alarmIfExpectedLogLineIsMissing(
    scope: constructs.Construct,
    id: string,
    logGroup: logs.LogGroup,
    alarmTopic: sns.ITopic,
    filterPattern: logs.IFilterPattern,
    period: cdk.Duration = cdk.Duration.hours(1),
    evaluationPeriods: number = 8
) {
    const metricFilter = logGroup.addMetricFilter(
        `${id}SuccessMetricFilter`,
        {
            filterPattern,
            metricName: `${id}Success`,
            metricNamespace: "Oppijanumerorekisteri",
            metricValue: "1",
        }
    );
    const alarm = new cloudwatch.Alarm(scope, `${id}FailingAlarm`, {
        alarmName: id,
        metric: metricFilter.metric({
            statistic: "Sum",
            period,
        }),
        comparisonOperator:
        cloudwatch.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 0,
        evaluationPeriods,
        treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    });
    alarm.addOkAction(new cloudwatch_actions.SnsAction(alarmTopic));
    alarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmTopic));
}