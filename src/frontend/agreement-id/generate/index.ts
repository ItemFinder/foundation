import { DynamoDBClient, QueryCommand, QueryCommandInput, QueryCommandOutput } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.REGION
});

const tableName = process.env.AGREEMENT_ID_TABLE;

exports.handler = async (): Promise<{ agreementId: string }> => {
  let agreementId: string;
  let isUnique = false;

  while (!isUnique) {
    agreementId = generateAgreementId();
    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: 'AgreementIdIndex',
      KeyConditionExpression: 'agreementId = :agreementId',
      ExpressionAttributeValues: {
        ':agreementId': { S: agreementId }
      }
    };

    const command = new QueryCommand(params);
    const response: QueryCommandOutput = await client.send(command);

    if (response.Items?.length === 0) {
      isUnique = true;
      return { agreementId };
    }
  }

  throw new Error('Unable to generate a unique agreement ID');
};

function generateAgreementId(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
