import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import * as path from 'path';

const BUCKET_NAME = 'soundspirewebsiteassets';
const REGION = 'ap-south-1';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Reference existing S3 bucket (don't create a new one)
    const bucket = s3.Bucket.fromBucketName(this, 'SoundSpireBucket', BUCKET_NAME);

    // ── IAM Role for MediaConvert ──────────────────────────────────────────
    const mediaConvertRole = new iam.Role(this, 'MediaConvertRole', {
      roleName: 'SoundSpireMediaConvertRole',
      assumedBy: new iam.ServicePrincipal('mediaconvert.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
      ],
    });

    // ── IAM Role for Lambda ────────────────────────────────────────────────
    const lambdaRole = new iam.Role(this, 'MediaConvertLambdaRole', {
      roleName: 'SoundSpireMediaConvertLambdaRole',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSElementalMediaConvertFullAccess'),
      ],
    });

    // ── Lambda Function ────────────────────────────────────────────────────
    // Note: run `npm install` in the lambda/ directory before deploying
    const triggerFn = new lambda.Function(this, 'MediaConvertTrigger', {
      functionName: 'soundspire-mediaconvert-trigger',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'mediaconvert-trigger.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      environment: {
        MEDIACONVERT_ROLE_ARN: mediaConvertRole.roleArn,
        // MediaConvert endpoint is account-specific — set this after first deploy
        // Run: aws mediaconvert describe-endpoints --region ap-south-1
        MEDIACONVERT_ENDPOINT: process.env.MEDIACONVERT_ENDPOINT || '',
      },
    });

    // ── S3 Event Notifications → Lambda ───────────────────────────────────
    // Trigger on video uploads to posts/, chat/, fan-art/
    const videoPrefixes = ['posts/', 'chat/', 'fan-art/'];
    const videoSuffixes = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.m4p', '.wmv',
                           '.MP4', '.MOV', '.AVI', '.MKV', '.WEBM', '.M4V', '.M4P', '.WMV'];

    for (const prefix of videoPrefixes) {
      for (const suffix of videoSuffixes) {
        bucket.addEventNotification(
          s3.EventType.OBJECT_CREATED,
          new s3n.LambdaDestination(triggerFn),
          { prefix, suffix }
        );
      }
    }

    // ── Outputs ────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'MediaConvertRoleArn', {
      value: mediaConvertRole.roleArn,
      description: 'Set this as MEDIACONVERT_ROLE_ARN in Lambda env vars',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: triggerFn.functionName,
    });
  }
}
