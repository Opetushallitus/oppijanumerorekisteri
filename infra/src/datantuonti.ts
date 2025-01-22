import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as constructs from "constructs";

export class ExportStack extends cdk.Stack {
    readonly bucket: s3.Bucket;
    readonly encryptionKey: kms.Key;

    constructor(scope: constructs.Construct, id: string) {
        super(scope, id);

        const targetAccountPrincipal = this.createTargetAccountPrincipal();
        this.bucket = this.createExportBucket(targetAccountPrincipal);
        this.encryptionKey = this.createEncryptionKey(targetAccountPrincipal);
    }

    private createEncryptionKey(targetAccountPrincipal: iam.AccountPrincipal) {
        const key = new kms.Key(this, "S3EncryptionKey", {
            enableKeyRotation: true,
        });

        key.grantDecrypt(targetAccountPrincipal);

        return key;
    }

    private createTargetAccountPrincipal() {
        const targetAccountId = ssm.StringParameter.valueFromLookup(
            this,
            "oppijanumerorekisteri.tasks.datantuonti.export.role.target-account-id"
        );

        return new iam.AccountPrincipal(targetAccountId);
    }

    private createExportBucket(targetAccountPrincipal: iam.AccountPrincipal) {
        const bucket = new s3.Bucket(this, "ExportBucket");

        bucket.addLifecycleRule({
            id: "DeleteDatantuontiObjectsAfterSevenDays",
            enabled: true,
            expiration: cdk.Duration.days(7),
            prefix: "oppijanumerorekisteri/v1/csv/",
        });
        bucket.grantRead(targetAccountPrincipal);

        return bucket;
    }
}