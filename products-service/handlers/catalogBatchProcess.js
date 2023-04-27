import { PublishCommand } from '@aws-sdk/client-sns';
import { snsClient } from '../services/sns/sns-client.js';

const TOPIC_ARN = process.env.SNS_ARN; 

export const catalogBatchProcess = async event => {
  console.log('SQS Event: ', event);
  const processingPromises = [];

  event.Records.forEach(record => {
    console.log('Record to handle: ', record);

    const params = {
      Subject: 'New Products have been added to the Store DB',
      Message: record.body,
      TopicArn: TOPIC_ARN
    };

    processingPromises.push(new Promise(async resolve => {
      try {
        console.log('SNS Push Params: ', params);
        const data = await snsClient.send(new PublishCommand(params));
        console.log('Success.', data);
        resolve(data);
      } catch (err) {
        console.log('Error', err.stack);
      }
    }));
    
  });

  return Promise.all(processingPromises).then(values => {
    console.log('Processed SNS events: ', values);
  });;
};

export default catalogBatchProcess;