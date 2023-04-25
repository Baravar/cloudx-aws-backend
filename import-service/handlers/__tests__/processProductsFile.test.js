import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { processProductsFile } from '../processProductsFile.js';
import { Readable } from 'stream';

const mockReadStream = () => {
  const readable = new Readable();
  readable.push('"line 1"');
  readable.push('"line 2"');
  readable.push(null);

  return readable;
};

const s3EventMock = {
  Records: [
    {
      s3: {
        object: { key: 'uploaded/fileToProcess.csv' }
      }
    }
  ]
};

describe('processProductsFile', () => {
  it('should execute file copy to /parsed directory and delete it from /uploaded directory', async () => {
    const s3ClientMock = mockClient(S3Client);

    s3ClientMock.on(GetObjectCommand).resolves({ Body: mockReadStream() });
    s3ClientMock.on(CopyObjectCommand).resolves();
    s3ClientMock.on(DeleteObjectCommand).resolves();

    await processProductsFile(s3EventMock);

    // check number of operations executed
    expect(s3ClientMock).toHaveReceivedCommandTimes(GetObjectCommand, 1);
    expect(s3ClientMock).toHaveReceivedCommandTimes(CopyObjectCommand, 1);
    expect(s3ClientMock).toHaveReceivedCommandTimes(DeleteObjectCommand, 1);

    // check input params of operations executed
    expect(s3ClientMock).toHaveReceivedCommandWith(GetObjectCommand, {
      Bucket: 'ng-store-file-import',
      Key: 'uploaded/fileToProcess.csv'
    });
    expect(s3ClientMock).toHaveReceivedCommandWith(CopyObjectCommand, {
      Bucket: 'ng-store-file-import',
      CopySource: 'ng-store-file-import/uploaded/fileToProcess.csv',
      Key: 'parsed/fileToProcess.csv'
    });
    expect(s3ClientMock).toHaveReceivedCommandWith(DeleteObjectCommand, {
      Bucket: 'ng-store-file-import',
      Key: 'uploaded/fileToProcess.csv'
    });
  });

  it('should report errors to console on failure to copy file from /parsed directory and delete file from /uploaded directory', async () => {
    const s3ClientMock = mockClient(S3Client);

    s3ClientMock.on(GetObjectCommand).resolves({ Body: mockReadStream() });
    s3ClientMock.on(CopyObjectCommand).rejects('copy error');
    s3ClientMock.on(DeleteObjectCommand).rejects('delete error');

    await processProductsFile(s3EventMock);

    expect(s3ClientMock).toHaveReceivedCommand(GetObjectCommand);
    expect(s3ClientMock).toHaveReceivedCommand(CopyObjectCommand);
    expect(s3ClientMock).toHaveReceivedCommand(DeleteObjectCommand);
  });
});
