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
              actions: ['dynamodb:Query', 'dynamodb:PutItem'],
              resources: [companyTable.tableArn, `${companyTable.tableArn}/index/AgreementIdIndex`]
            })
          ]
        })
      }
    });

    const generateAgreementId = new lambda.Function(this, 'GenerateAgreementId', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist/generate-agreement-id'),
      role: generateAgreementIdRole,
      environment: {
        COMPANY_TABLE: companyTable.tableName
      }
    });

    const checkAgreementIdRole = new iam.Role(this, 'CheckAgreementIdRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for the Lambda function that check for an agreement ID in the database',
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
      inlinePolicies: {
        aggrementTableQuery: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['dynamodb:Query'],
              resources: [companyTable.tableArn, `${companyTable.tableArn}/index/AgreementIdIndex`]
            })
          ]
        })
      }
    });

    const checkAgreementId = new lambda.Function(this, 'CheckAgreementId', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist/check-agreement-id'),
      role: checkAgreementIdRole,
      environment: {
        COMPANY_TABLE: companyTable.tableName
      }
    });

    const addCompanyInfoRole = new iam.Role(this, 'AddCompanyInfoRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for the Lambda function updates the company information in the database',
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
      inlinePolicies: {
        aggrementTableQuery: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['dynamodb:UpdateItemCommand'],
              resources: [companyTable.tableArn]
            })
          ]
        })
      }
    });

    const addCompanyInfo = new lambda.Function(this, 'AddCompanyInfo', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist/add-company-info'),
      role: addCompanyInfoRole,
      environment: {
        COMPANY_TABLE: companyTable.tableName
      }
    });

    const checkConfirmationRole = new iam.Role(this, 'CheckConfirmationRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for the Lambda function checks if the company registration is complete',
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
      inlinePolicies: {
        aggrementTableQuery: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['dynamodb:Query'],
              resources: [companyTable.tableArn, `${companyTable.tableArn}/index/AgreementIdIndex`]
            })
          ]
        })
      }
    });

    const checkConfirmation = new lambda.Function(this, 'CheckConfirmation', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist/check-confirmation'),
      role: addCompanyInfoRole,
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

    new cdk.CfnOutput(this, 'CheckAgreementIdFunctionName', {
      key: 'CheckAgreementIdFunctionName',
      value: checkAgreementId.functionName,
      description: 'The name of the Lambda function for checking agreement IDs'
    });

    new cdk.CfnOutput(this, 'AddCompanyInfoFunctionName', {
      key: 'AddCompanyInfoFunctionName',
      value: addCompanyInfo.functionName,
      description: 'The name of the Lambda function for adding company information'
    });

    new cdk.CfnOutput(this, 'CheckConfirmationFunctionName', {
      key: 'CheckConfirmationFunctionName',
      value: checkConfirmation.functionName,
      description: 'The name of the Lambda function for checking company registration'
    });
  }
}
