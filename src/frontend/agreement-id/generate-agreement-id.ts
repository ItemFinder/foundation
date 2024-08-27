import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.REGION
});

const tableName = process.env.AGREEMENT_ID_TABLE;

interface Event {
  email: string;
}

exports.handler = async (event: Event) => {
  const email = event.email;
  let agreementId: string;
  let isUnique = false;

  while (!isUnique) {
    agreementId = generateAgreementId();
    const params = {
      TableName: tableName,
      Key: {
        email: { S: email }
      }
    };

    const result = await client.send(new GetItemCommand(params));

    if (!result.Item) {
      isUnique = true;
    }
  }

  // const putParams = {
  //   TableName: tableName,
  //   Item: {
  //     email: email,
  //     agreementId: agreementId
  //   }
  // };

  // await dynamoDb.put(putParams).promise();

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({ agreementId: agreementId })
  // };
};

function generateAgreementId(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
