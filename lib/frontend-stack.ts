import * as cdk from 'aws-cdk-lib';
import { TableV2, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const agreementIdTable = new TableV2(this, 'AgreementIdTable', {
      partitionKey: { name: 'email', type: AttributeType.STRING },
      sortKey: { name: 'agreementId', type: AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    agreementIdTable.addGlobalSecondaryIndex({
      indexName: 'AgreementIdIndex',
      partitionKey: { name: 'agreementId', type: AttributeType.STRING }
    });

    new cdk.CfnOutput(this, 'AgreementIdTableName', {
      key: 'AgreementIdTableName',
      value: agreementIdTable.tableName,
      description: 'The name of the DynamoDB table for storing agreement IDs'
    });
  }
}
