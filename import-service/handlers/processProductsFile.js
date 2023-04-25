import  csvParser  from 'csv-parser';
import { S3Client, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand} from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

export const processProductsFile = async event => {
  console.log(event);

  const filePath = event.Records[0].s3.object.key;
  console.log('File path:', filePath);

  const results = [];

  const bucketName = 'ng-store-file-import';
  const s3Params = { region: 'us-east-1' };
  const sqsParams = { region: 'us-east-1' };

  const getObjectParams = {
    Bucket: bucketName,
    Key: filePath
  };

  const copyObjectParams = {
    Bucket: bucketName,
    CopySource: bucketName + '/' + filePath,
    Key: filePath.replace('uploaded', 'parsed')
  };

  const deleteObjectParams = {
    Bucket: bucketName,
    Key: filePath
  };

  const client = new S3Client(s3Params);
  const getCommand = new GetObjectCommand(getObjectParams);
  const copyCommand = new CopyObjectCommand(copyObjectParams);
  const deleteCommand = new DeleteObjectCommand(deleteObjectParams);

  const fileToProcess = await client.send(getCommand);

  const processItem = fileToProcess => {
    const SQSclient = new SQSClient(sqsParams);

    return new Promise( resolve => {
      fileToProcess.Body.pipe(csvParser())
        .on('data', data => {
          results.push(data);

          const params = {
            QueueUrl: process.env.SQS_URL,
            MessageBody: JSON.stringify(data)
          };
          
          const command = new SendMessageCommand(params);

          SQSclient.send(command)
            .then(
              data => {
                console.log('Data sent to SQS: ', data);
              },
              error => {
                console.log('Failed sending the message to SQS: ', error);
              }
            );
        })
        .on('end', async () => {
          await client.send(copyCommand)
            .then(() => {
              console.log('File copied to /parsed directory');
            })
            .catch(e => {
              console.log('Failed to copy the file.', e);
            });

          await client
            .send(deleteCommand)
            .then(() => {
              console.log('File deleted from /uploaded directory');
            })
            .catch(e => {
              console.log('Failed to delete the file.', e);
            });

          console.log('CSV parsing stream ended: ', results);
          resolve();
        });
    });
  };

  return Promise.all([processItem(fileToProcess)]);
};

export default processProductsFile;