// import {
//   DynamoDBClient,
//   GetItemCommand,
//   QueryCommand,
//   QueryCommandInput,
//   QueryCommandOutput
// } from '@aws-sdk/client-dynamodb';

// const client = new DynamoDBClient({
//   region: process.env.REGION
// });

// const tableName = process.env.AGREEMENT_ID_TABLE;

// exports.handler = async (): Promise<{ generated: boolean }> => {
//   let agreementId: string;
//   let isUnique = false;

//   while (!isUnique) {
//     agreementId = generateAgreementId();
//     const params: QueryCommandInput = {
//       TableName: tableName,
//       KeyConditionExpression: 'email = :email',
//       ExpressionAttributeValues: {
//         ':email': { S: email }
//       }
//     };

//     const command = new QueryCommand(params);
//     const response: QueryCommandOutput = await client.send(command);
//   }

//   // const putParams = {
//   //   TableName: tableName,
//   //   Item: {
//   //     email: email,
//   //     agreementId: agreementId
//   //   }
//   // };

//   // await dynamoDb.put(putParams).promise();

//   // return {
//   //   statusCode: 200,
//   //   body: JSON.stringify({ agreementId: agreementId })
//   // };
// };

// function generateAgreementId(): string {
//   return Math.floor(10000 + Math.random() * 90000).toString();
// }
