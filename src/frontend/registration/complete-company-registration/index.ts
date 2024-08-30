import {
  DynamoDBClient,
  UpdateItemCommand,
  type UpdateItemCommandInput,
  type UpdateItemCommandOutput
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.REGION
});

const tableName = process.env.COMPANY_TABLE;

type Event = {
  agreementId: string;
};

export const handler = async (event: Event): Promise<void> => {
  // Update the item with the company confirmation status
  const params: UpdateItemCommandInput = {
    TableName: tableName,
    Key: {
      agreementId: { S: event.agreementId }
    },
    UpdateExpression: 'SET confirmed = :confirmed',
    ExpressionAttributeValues: {
      ':confirmed': { BOOL: true }
    }
  };

  const command = new UpdateItemCommand(params);
  const response: UpdateItemCommandOutput = await client.send(command);

  if (response.$metadata.httpStatusCode !== 200) {
    throw new Error('Unable to update the company confirmation status');
  }

  return;
};
