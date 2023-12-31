import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider"; // ES Modules import

const client = new CognitoIdentityProviderClient({ region: "eu-west-1" });

type eventBody = {
  username: string;
  email: string;
  password: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log("[EVENT]", event);

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "You must provide an email and password",
      }),
    };
  }

  const { username, email, password }: eventBody = JSON.parse(event.body);

  const params: SignUpCommandInput = {
    ClientId: process.env.CLIENT_ID!,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  };

  try {
    const command = new SignUpCommand(params);
    const res = await client.send(command);
    console.log("[AUTH]", res);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: res,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err,
      }),
    };
  }
};
