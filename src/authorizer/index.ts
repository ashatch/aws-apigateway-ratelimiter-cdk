import { Handler } from "aws-lambda";
import { Logger } from "../logger/logger";

interface HeaderMap {
  [key: string]: string;
}

export interface AuthorizerRequest {
  headers: HeaderMap;
}

export interface AuthorizerResponse {
  principalId: string
  usageIdentifierKey: string
  policyDocument: any
}

function allowResponse(principalId: string, apiKey: string): any {
  return {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: "*"
        }
      ]
    },
    usageIdentifierKey: apiKey
  }
}

function denyResponse(): any {
  return {
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Deny",
          Resource: "*"
        }
      ]
    }
  }
}

const handler: Handler = async (event: AuthorizerRequest): Promise<AuthorizerResponse> => {
  Logger.info('Authorizer handler invoked', event);
  // event will contain, e.g. headers to inspect
  // also see denyResponse();
  return allowResponse('some-principal', 'some-api-key');
};

export { handler };
