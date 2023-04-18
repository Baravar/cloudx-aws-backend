import  csvParser  from 'csv-parser';
import { S3Client, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand} from '@aws-sdk/client-s3';

export const processProductsFile = async event => {
  console.log(event);

  const filePath = event.Records[0].s3.object.key;
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

  fileToProcess.Body.pipe(csvParser())
    .on('data', data => {
      results.push(data);
    })
    .on('end', async () => {
      console.log('CSV pasring stream ended: ', results);

      const copyResult = await client.send(copyCommand);
      console.log('File copied: ', copyResult);

      const deleteResult = await client.send(deleteCommand);
      console.log('File removed: ', deleteResult);
    });
};

export default processProductsFile;