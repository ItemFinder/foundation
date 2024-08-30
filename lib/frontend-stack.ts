import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //#region Company Database Setup
    const companyTable = new dynamodb.TableV2(this, 'CompanyTable', {
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'agreementId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    companyTable.addGlobalSecondaryIndex({
      indexName: 'AgreementIdIndex',
      partitionKey: { name: 'agreementId', type: dynamodb.AttributeType.STRING }
    });

    const generateAgreementIdRole = new iam.Role(this, 'GenerateAgreementIdRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for the Lambda function that generates agreement IDs',
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
      inlinePolicies: {
        aggrementTableQuery: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['dynamodb:Query'],
              resources: [`${companyTable.tableArn}/index/AgreementIdIndex`]
            })
          ]
        })
      }
    });

    const generateAgreementId = new lambda.Function(this, 'GenerateAgreementId', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist'),
      role: generateAgreementIdRole,
      environment: {
        COMPANY_TABLE: companyTable.tableName
      }
    });
    //#endregion

    new cdk.CfnOutput(this, 'CompanyTableName', {
      key: 'CompanyTableName',
      value: companyTable.tableName,
      description: 'The name of the DynamoDB table for storing registered companies'
    });

    new cdk.CfnOutput(this, 'GenerateAgreementIdFunctionName', {
      key: 'GenerateAgreementIdFunctionName',
      value: generateAgreementId.functionName,
      description: 'The name of the Lambda function for generating agreement IDs'
    });
  }
}
