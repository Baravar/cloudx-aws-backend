jest.mock('@aws-sdk/s3-request-presigner');
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { importProductsFile } from '../importProductsFile.js';

describe('importProductsFile', () => {
  it('should escape execution if http event is missing name in queryStringParameters', async () => {
    const eventMock = {};
    await expect(importProductsFile(eventMock)).resolves.toBe(undefined);
  });

  it('should return HTTP response with signed URL for the file name taken from queryStringParameters', async () => {
    const signedUrlMockData = 'https://my-bucket.s3.us-east-1.amazonaws.com/uploaded/fileName.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&x-id=PutObject';
    const expectedResponse = {
      body: '"https://my-bucket.s3.us-east-1.amazonaws.com/uploaded/fileName.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&x-id=PutObject"',
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'content-type': 'application/json'
      },
      statusCode: 200
    };

    getSignedUrl.mockImplementationOnce(() => signedUrlMockData);
    
    const eventMock = {
      queryStringParameters: {
        name: 'fileName.csv'
      }
    };

    await expect(importProductsFile(eventMock)).resolves.toStrictEqual(
      expectedResponse
    );
  });

  it('should handle server error when attemping to generate signed URL', async () => {
    const expectedResponse = {
      body: '{"message":"Failed to generated pre-signed URL for fileName.csv"}',
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'content-type': 'application/json'
      },
      statusCode: 500
    };
    
    getSignedUrl.mockImplementationOnce(() => {
      return Promise.reject();
    });

    const eventMock = {
      queryStringParameters: {
        name: 'fileName.csv'
      }
    };

    await expect(importProductsFile(eventMock)).resolves.toStrictEqual(
      expectedResponse
    );
  });
});
