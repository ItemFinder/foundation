import {
  DynamoDBClient,
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.REGION
});

const tableName = process.env.COMPANY_TABLE;

type InputEvent = {
  x_correlation_id: string;
  input: {
    agreementId: string;
    adminEmail: string;
    companyName: string;
    phoneNumber: string;
  };
};

type OutputEvent = {
  output: {
    agreementIdFound: boolean;
  };
} & InputEvent;

export const handler = async (event: InputEvent): Promise<OutputEvent> => {
  // Check if the agreement ID already exists in the table
  let agreementIdFound = false;
  const params: QueryCommandInput = {
    TableName: tableName,
    IndexName: 'AgreementIdIndex',
    KeyConditionExpression: 'agreementId = :agreementId',
    ExpressionAttributeValues: {
      ':agreementId': { S: event.input.agreementId }
    }
  };

  const command = new QueryCommand(params);
  const response: QueryCommandOutput = await client.send(command);

  if (response.Items?.length === 0) {
    agreementIdFound = false;
  } else {
    agreementIdFound = true;
  }

  return {
    ...event,
    output: {
      agreementIdFound
    }
  };
};
