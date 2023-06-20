import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
} from "@aws-sdk/client-cognito-identity-provider"; // ES Modules import

const client = new CognitoIdentityProviderClient({ region: "eu-west-1" });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log("[EVENT]", event);

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "You must provide a username and password",
      }),
    };
  }

  const { username, password } = JSON.parse(event.body);

  const params: InitiateAuthCommandInput = {
    ClientId: process.env.CLIENT_ID!,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const command = new InitiateAuthCommand(params);
    const { AuthenticationResult } = await client.send(command);

    if (!AuthenticationResult) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "User signin failed",
        }),
      };
    }
    console.log("[AUTH]", AuthenticationResult);

    const token = AuthenticationResult.IdToken;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Set-Cookie": `token=${token}; SameSite=None; Secure; HttpOnly; Path=/; Max-Age=3600;`,
      },
      body: JSON.stringify({
        message: "Auth successfull",
        token: token,
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
