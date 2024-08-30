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

interface InputEvent {
  x_correlation_id: string;
  input: {
    agreementId: string;
    adminEmail: string;
    companyName: string;
    phoneNumber: string;
    countryCode: string;
  };
  output: {
    agreementIdFound: boolean;
  };
}

interface OutputEvent extends InputEvent {
  output: {
    agreementIdFound: boolean;
    companyRegistrationDone: boolean;
  };
}

export const handler = async (event: InputEvent): Promise<OutputEvent> => {
  // Update the item with the company details
  const params: UpdateItemCommandInput = {
    TableName: tableName,
    Key: {
      email: { S: event.input.adminEmail },
      agreementId: { S: event.input.agreementId }
    },
    UpdateExpression:
      'SET companyName = :companyName, countryCode = :countryCode, phoneNumber = :phoneNumber, confirmed = :confirmed',
    ExpressionAttributeValues: {
      ':companyName': { S: event.input.companyName },
      ':countryCode': { S: event.input.countryCode },
      ':phoneNumber': { S: event.input.phoneNumber },
      ':confirmed': { BOOL: false }
    }
  };

  const command = new UpdateItemCommand(params);
  const response: UpdateItemCommandOutput = await client.send(command);

  if (response.$metadata.httpStatusCode !== 200) {
    throw new Error('Unable to update the company details');
  }

  return {
    ...event,
    output: {
      ...event.output,
      companyRegistrationDone: false
    }
  };
};
