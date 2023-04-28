import { PublishCommand } from '@aws-sdk/client-sns';
import { snsClient } from '../services/sns/sns-client.js';
import putItem from '../services/dynamodb/ddb-method-put-item.js';
import { v4 as uuidv4 } from 'uuid';

const TOPIC_ARN = process.env.SNS_ARN; 
const STOCKS_DB = process.env.STOCKS_DB_NAME;
const PRODUCTS_DB = process.env.PRODUCTS_DB_NAME;

export const catalogBatchProcess = async event => {
  console.log('SQS Event: ', event);
  const processingPromises = [];

  event.Records.forEach(record => {
    console.log('SNS Record to handle: ', record);

    const product = JSON.parse(record.body);
    console.log('Product details: ', product);

    const uniqueProductId = uuidv4();
    const productsItemPayload = {
      id: uniqueProductId,
      title: product.title,
      description: product.description || '',
      image: product.image || '',
      price: product.price || 0,
      size: product.size.split(',') || []
    };

    const stocksItemPayload = {
      product_id: uniqueProductId,
      count: Number(product.count) || 0
    };

    const props = ['title', 'description', 'size', 'price', 'image', 'count'];
    const missedFromSchema = props.find(
      prop => !product.hasOwnProperty(prop)
    );

    const SNSPushParams = {
      Subject: 'CloudX - New Product added to the Store DB',
      Message: `"${product.title}" product has been added to the Store DB tables with the id [ ${uniqueProductId} ]`,
      MessageAttributes: {
        notify: {
          DataType: 'String',
          StringValue: 'false'
        }
      },
      TopicArn: TOPIC_ARN
    };

    // Apply filtering for SNS Subscription based on message attribute defined in serverless.yaml
    if (Number(product.count) === 0) {
      SNSPushParams.MessageAttributes.notify.StringValue = 'true';
    }

    processingPromises.push(new Promise(async (resolve, reject) => {
      try {
        if (missedFromSchema) {
          reject(
            `This request is missing payload or required field - ${missedFromSchema}`
          );
          return;
        }
        
        // write to DynamoDB tables
        await putItem(PRODUCTS_DB, productsItemPayload);
        await putItem(STOCKS_DB, stocksItemPayload);
        console.log(`Product with ID [ ${uniqueProductId} ] has been pushed to DB tables`);

        console.log('SNS Push params: ', SNSPushParams);
        const data = await snsClient.send(new PublishCommand(SNSPushParams));
        console.log('SNS Push Success.', data);
        resolve(data);
      } catch (err) {
        console.log('SNS Push Error', err.stack);
        reject(err.stack);
      }
    }));
  });

  return Promise.all(processingPromises).then(values => {
    console.log('Processed SNS events: ', values);
  });;
};

export default catalogBatchProcess;