import {
  DynamoDBClient,
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
  PutItemCommand,
  type PutItemCommandInput,
  type PutItemCommandOutput
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.REGION
});

const tableName = process.env.COMPANY_TABLE;

type Event = {
  email: string;
};

export const handler = async (event: Event): Promise<{ agreementId: string }> => {
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

      // Insert the new agreement ID into the table
      const putParams: PutItemCommandInput = {
        TableName: tableName,
        Item: {
          agreementId: { S: agreementId },
          email: { S: event.email }
        }
      };
      const putCommand = new PutItemCommand(putParams);
      const response: PutItemCommandOutput = await client.send(putCommand);
      if (response.$metadata.httpStatusCode !== 200) {
        throw new Error('Unable to insert the new agreement ID into the table');
      }

      return { agreementId };
    }
  }

  throw new Error('Unable to generate a unique agreement ID');
};

function generateAgreementId(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
