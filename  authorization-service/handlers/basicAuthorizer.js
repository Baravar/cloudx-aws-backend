export const basicAuthorizer = async (event) => {
  console.log('Auth Event: ', event);

  if (!event.headers.authorization) {
    console.log('Placeholder for 401 HTTP status - Authorization header is not provided');
    return;
  }

  const decodedBase64AuthHeader = Buffer.from(event.headers.authorization, 'base64');
  console.log('decodedBase64AuthHeader: ', decodedBase64AuthHeader);

  if (decodedBase64AuthHeader === `Basic baravar:${process.env.AUTH_TOKEN}`) {
    return {
      principalId: 'importProductsFileAuthorizer',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.routeArn,
          },
        ],
      },
    };
  } else {
    console.log('Placeholder for 403 HTTP status - access is denied for this user (invalid authorization_token)');
    return {
      principalId: 'importProductsFileAuthorizer',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.routeArn,
          },
        ],
      },
    };
  }
};

export default basicAuthorizer;
