import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CdklocalBugStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // DynamoDB Table

    const dynamoDBTable = new dynamodb.Table(this, 'MyDynamoDBTable', {
      partitionKey: { name: 'itemId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaFunction = new lambda.Function(this, 'MyFunction', {
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
    exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'success',
          body: "HELLO",
        }),
    };
    }
  `),
      runtime: lambda.Runtime.NODEJS_20_X,
    });

    // Grant Lambda permissions to read/write from/to DynamoDB
    dynamoDBTable.grantReadWriteData(lambdaFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'MyApi', {
      restApiName: 'MyApi',
      description: 'My API Gateway',
    });

    const integration = new apigateway.LambdaIntegration(lambdaFunction);
    const resource = api.root.addResource('hello');
    resource.addMethod('GET', integration);
  }
}
