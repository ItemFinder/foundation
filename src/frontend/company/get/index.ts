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

interface Event {
  agreementId: string;
}

interface Response {
  agreementId: string;
  companyName: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  confirmed: boolean;
}

export const handler = async (event: Event): Promise<Response> => {
  console.log('event:', event);

  const params: QueryCommandInput = {
    TableName: tableName,
    IndexName: 'AgreementIdIndex',
    KeyConditionExpression: 'agreementId = :agreementId',
    ExpressionAttributeValues: {
      ':agreementId': { S: event.agreementId }
    }
  };

  const command = new QueryCommand(params);
  const response: QueryCommandOutput = await client.send(command);

  if (!response.Items || response.Items.length === 0) {
    // Something is very wrong if we can't find the agreement ID
    throw new Error('Unable to find the agreement ID in the table');
  }

  if (response.Items.length > 1) {
    // Something is very wrong if we find more than one agreement ID
    throw new Error('Unable to find the agreement ID in the table');
  }

  // we have one item, lets check if it is confirmed
  const item = response.Items[0];

  return {
    agreementId: item.agreementId.S || '',
    companyName: item.companyName.S || '',
    countryCode: item.countryCode.S || '',
    phoneNumber: item.phoneNumber.S || '',
    email: item.email.S || '',
    confirmed: item.confirmed.BOOL || false
  };
};
