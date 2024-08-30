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

interface InputEvent {
  x_correlation_id: string;
  input: {
    agreementId: string;
    adminEmail: string;
    companyName: string;
    phoneNumber: string;
  };
  output: {
    agreementIdFound: boolean;
    companyRegistrationDone: boolean;
  };
}

interface OutputEvent extends InputEvent {
  output: {
    agreementIdFound: boolean;
    companyRegistrationDone: boolean;
  };
}

export const handler = async (event: InputEvent): Promise<OutputEvent> => {
  // Check the agreement id in the table and see if it is confirmed

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
  if (item.confirmed.BOOL) {
    return {
      ...event,
      output: {
        agreementIdFound: true,
        companyRegistrationDone: true
      }
    };
  } else {
    return {
      ...event,
      output: {
        agreementIdFound: true,
        companyRegistrationDone: false
      }
    };
  }
};
