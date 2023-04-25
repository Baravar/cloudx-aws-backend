import  csvParser  from 'csv-parser';
import { S3Client, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand} from '@aws-sdk/client-s3';

export const processProductsFile = async event => {
  console.log(event);

  const filePath = event.Records[0].s3.object.key;
  console.log('File path:', filePath);

  const results = [];

  const bucketName = 'ng-store-file-import';
  const s3Params = { region: 'us-east-1' };

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
    return new Promise( resolve => {
      fileToProcess.Body.pipe(csvParser())
        .on('data', data => {
          results.push(data);
        })
        .on('end', async () => {
          await client.send(copyCommand)
            .then(() => {
              console.log('File copied to /parsed directory');
            })
            .catch(e => {
              console.log('File copy failed.', e);
            });

          await client
            .send(deleteCommand)
            .then(() => {
              console.log('File deleted from /uploaded directory');
            })
            .catch(e => {
              console.log('File delete failed.', e);
            });

          console.log('CSV parsing stream ended: ', results);
          resolve();
        });
    });
  };

  return Promise.all([processItem(fileToProcess)]);
};

export default processProductsFile;