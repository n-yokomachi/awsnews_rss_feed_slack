import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";



// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsnewsRssFeedSlackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* Lambda */
    const awsnewsRssFeedSlackLambda = new nodejs.NodejsFunction(
      this,
      "awsnewsRssFeedSlack",
      {
        entry: "src/index.ts",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment:{
          SLACK_INCOMING_WEBHOOK_URL:
            ssm.StringParameter.valueForStringParameter(
              this,
              "/AWSNEWS_RSS_FEED_SLACK/SLACK_INCOMING_WEBHOOK_URL"
            ),
        },
        functionName:"AwsNewsRssFeedSlack",
        description:"Translate the latest AWS information into Japanese and notify to Slack.",
        timeout: Duration.seconds(60 * 15),
        memorySize: 1024,
      }
    );

    /* Lambdaにアタッチするポリシー */
    awsnewsRssFeedSlackLambda.role?.attachInlinePolicy(
      new iam.Policy(this, "translateText-policy", {
        statements:[
          new iam.PolicyStatement({
            actions:["translate:TranslateText"],
            resources:["*"],
          })
        ]
      })
    );

    /* EventBridge */
    new events.Rule(this, "awsnewsRssFeedSlackRule", {
      ruleName: "AwsNewsRssFeedSlack",
      description: "Translate the latest AWS information into Japanese and notify to Slack.",
      schedule: events.Schedule.cron({minute:"45", hour:"0", }),
      targets:[
        new targets.LambdaFunction(awsnewsRssFeedSlackLambda, {
          retryAttempts: 3,
        }),
      ],
    });

  }
}
