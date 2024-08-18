import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CognitoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new cognito.UserPool(this, 'captureituserpool', {
      userPoolName: 'captureit-userpool',
      signInCaseSensitive: false, // case insensitive is preferred in most situations
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email for ItemFinder application',
        emailBody: 'Thanks for signing up to the ItemFinder application. Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: 'Thanks for signing up to the ItemFinder application. Your verification code is {####}'
      },
      signInAliases: {
        username: false,
        phone: false,
        email: true
      },
      autoVerify: { email: true, phone: false },
      standardAttributes: {
        email: {
          required: true,
          mutable: false
        },
        phoneNumber: {
          required: false,
          mutable: true
        },
        fullname: {
          required: true,
          mutable: true
        }
      },
      mfa: cognito.Mfa.OPTIONAL,
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(3)
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY
    });
  }
}
