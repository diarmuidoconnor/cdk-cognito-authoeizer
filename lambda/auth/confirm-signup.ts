import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider"; // ES Modules import

const client = new CognitoIdentityProviderClient({ region: "eu-west-1" });

type eventBody = { username: string; code: string };

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log("[EVENT]", event);

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "You must provide a verifcation code",
      }),
    };
  }

  const { username, code }: eventBody = JSON.parse(event.body);

  const params: ConfirmSignUpCommandInput = {
    ClientId: process.env.CLIENT_ID!,
    Username: username,
    ConfirmationCode: code,
  };

  try {
    const command = new ConfirmSignUpCommand(params);
    const res = await client.send(command);
    console.log("[AUTH]", res);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `User ${username} successfully confirmed`,
        confirmed: true,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err,
      }),
    };
  }
};
