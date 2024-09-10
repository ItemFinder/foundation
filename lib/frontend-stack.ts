import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
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
      code: lambda.Code.fromAsset('dist/registration/generate-agreement-id'),
      role: generateAgreementIdRole,
      environment: {
        COMPANY_TABLE: companyTable.tableName
      }
    });

    // const completeCompanyRegistrationRole = new iam.Role(this, 'CompleteCompanyRegistrationRole', {
    //   assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    //   description: 'Role for the Lambda function that completes the company registration',
    //   managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    //   inlinePolicies: {
    //     aggrementTableQuery: new iam.PolicyDocument({
    //       statements: [
    //         new iam.PolicyStatement({
    //           actions: ['dynamodb:UpdateItem'],
    //           resources: [companyTable.tableArn]
    //         })
    //       ]
    //     })
    //   }
    // });

    // const completeCompanyRegistration = new lambda.Function(this, 'CompleteCompanyRegistration', {
    //   runtime: lambda.Runtime.NODEJS_20_X,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset('dist/registration/complete-company-registration'),
    //   role: completeCompanyRegistrationRole,
    //   environment: {
    //     COMPANY_TABLE: companyTable.tableName
    //   }
    // });

    // const checkAgreementIdRole = new iam.Role(this, 'CheckAgreementIdRole', {
    //   assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    //   description: 'Role for the Lambda function that check for an agreement ID in the database',
    //   managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    //   inlinePolicies: {
    //     aggrementTableQuery: new iam.PolicyDocument({
    //       statements: [
    //         new iam.PolicyStatement({
    //           actions: ['dynamodb:Query'],
    //           resources: [companyTable.tableArn, `${companyTable.tableArn}/index/AgreementIdIndex`]
    //         })
    //       ]
    //     })
    //   }
    // });

    // const checkAgreementId = new lambda.Function(this, 'CheckAgreementId', {
    //   runtime: lambda.Runtime.NODEJS_20_X,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset('dist/registration/check-agreement-id'),
    //   role: checkAgreementIdRole,
    //   environment: {
    //     COMPANY_TABLE: companyTable.tableName
    //   }
    // });

    // const checkAgreementIdTask = new tasks.LambdaInvoke(this, 'CheckAgreementIdTask', {
    //   lambdaFunction: checkAgreementId,
    //   outputPath: '$.Payload'
    // });

    // const addCompanyInfoRole = new iam.Role(this, 'AddCompanyInfoRole', {
    //   assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    //   description: 'Role for the Lambda function updates the company information in the database',
    //   managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    //   inlinePolicies: {
    //     aggrementTableQuery: new iam.PolicyDocument({
    //       statements: [
    //         new iam.PolicyStatement({
    //           actions: ['dynamodb:UpdateItem'],
    //           resources: [companyTable.tableArn]
    //         })
    //       ]
    //     })
    //   }
    // });

    // const addCompanyInfo = new lambda.Function(this, 'AddCompanyInfo', {
    //   runtime: lambda.Runtime.NODEJS_20_X,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset('dist/registration/add-company-info'),
    //   role: addCompanyInfoRole,
    //   environment: {
    //     COMPANY_TABLE: companyTable.tableName
    //   }
    // });

    // const addCompanyInfoTask = new tasks.LambdaInvoke(this, 'AddCompanyInfoTask', {
    //   lambdaFunction: addCompanyInfo,
    //   outputPath: '$.Payload'
    // });

    // const checkConfirmationRole = new iam.Role(this, 'CheckConfirmationRole', {
    //   assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    //   description: 'Role for the Lambda function checks if the company registration is complete',
    //   managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    //   inlinePolicies: {
    //     aggrementTableQuery: new iam.PolicyDocument({
    //       statements: [
    //         new iam.PolicyStatement({
    //           actions: ['dynamodb:Query'],
    //           resources: [companyTable.tableArn, `${companyTable.tableArn}/index/AgreementIdIndex`]
    //         })
    //       ]
    //     })
    //   }
    // });

    // const checkConfirmation = new lambda.Function(this, 'CheckConfirmation', {
    //   runtime: lambda.Runtime.NODEJS_20_X,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset('dist/registration/check-confirmation'),
    //   role: checkConfirmationRole,
    //   environment: {
    //     COMPANY_TABLE: companyTable.tableName
    //   }
    // });

    // const checkConfirmationTask = new tasks.LambdaInvoke(this, 'CheckConfirmationTask', {
    //   lambdaFunction: checkConfirmation,
    //   outputPath: '$.Payload'
    // });

    // const endstate = new sfn.Pass(this, 'Endstate');

    // const wait10s = new sfn.Wait(scope, 'Wait10s', {
    //   time: sfn.WaitTime.duration(cdk.Duration.seconds(10))
    // });

    // // prettier-ignore
    // const outboundChain = sfn.Chain.start(
    //   checkAgreementIdTask
    //   .next(new sfn.Choice(scope, 'IsAgreementIdPresent?')
    //     .when(sfn.Condition.booleanEquals('$.output.agreementIdFound', false), endstate)
    //     .otherwise(
    //       addCompanyInfoTask
    //       .next(checkConfirmationTask
    //         .next(new sfn.Choice(scope, 'IsCompanyRegistrationDone?')
    //           .when(sfn.Condition.booleanEquals('$.output.companyRegistrationDone', true), endstate)
    //           .otherwise(wait10s.next(checkConfirmationTask))
    //         )
    //       )
    //     )
    //   )
    // );

    // const companyRegistrationStateMachine = new sfn.StateMachine(this, 'CompanyRegistrationStateMachine', {
    //   stateMachineName: 'CompanyRegistrationStateMachine',
    //   definitionBody: sfn.DefinitionBody.fromChainable(outboundChain),
    //   timeout: cdk.Duration.minutes(10)
    // });

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

    // new cdk.CfnOutput(this, 'CheckAgreementIdFunctionName', {
    //   key: 'CheckAgreementIdFunctionName',
    //   value: checkAgreementId.functionName,
    //   description: 'The name of the Lambda function for checking agreement IDs'
    // });

    // new cdk.CfnOutput(this, 'AddCompanyInfoFunctionName', {
    //   key: 'AddCompanyInfoFunctionName',
    //   value: addCompanyInfo.functionName,
    //   description: 'The name of the Lambda function for adding company information'
    // });

    // new cdk.CfnOutput(this, 'CheckConfirmationFunctionName', {
    //   key: 'CheckConfirmationFunctionName',
    //   value: checkConfirmation.functionName,
    //   description: 'The name of the Lambda function for checking company registration'
    // });

    // new cdk.CfnOutput(this, 'CompleteCompanyRegistrationFunctionName', {
    //   key: 'CheckConfirCompleteCompanyRegistrationFunctionNamemationFunctionName',
    //   value: completeCompanyRegistration.functionName,
    //   description: 'The name of the Lambda function that completes company registration'
    // });

    // new cdk.CfnOutput(this, 'CompanyRegistrationStateMachineArn', {
    //   key: 'CompanyRegistrationStateMachineArn',
    //   value: companyRegistrationStateMachine.stateMachineArn,
    //   description: 'The ARN of the Step Functions state machine for company registration'
    // });
  }
}
