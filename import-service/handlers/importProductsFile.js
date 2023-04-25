import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const importProductsFile = async (event) => {
  console.log(event);

  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'content-type': 'application/json'
  };

  let response = {};
  let responseStatusCode = 200;
  let responseBody = '';

  let filePath = '';
  let preSignedURL = '';

  if (!event.queryStringParameters?.name) {
    console.log('queryStringParameters are missing name');
    return;
  } else {
    filePath = event.queryStringParameters.name;
  }

  const clientParams = { region: 'us-east-1' };
  const putObjectParams = {
    Bucket: 'ng-store-file-import',
    Key: 'uploaded/' + filePath,
    ContentType: 'text/csv'
  };
  const client = new S3Client(clientParams);
  const command = new PutObjectCommand(putObjectParams);

  try {
    preSignedURL = await getSignedUrl(client, command, { expiresIn: 60 });
    responseBody = JSON.stringify(preSignedURL);
  } catch (error) {
    return (response = {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: `Failed to generated pre-signed URL for ${filePath}`
      })
    });
  }

  return (response = {
    statusCode: responseStatusCode,
    headers: defaultHeaders,
    body: responseBody
  });
};

export default importProductsFile;
