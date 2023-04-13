import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from './ddb-doc-client.js';

const putItem = async (targetTable, item) => {
  if (!targetTable || !item) {
    console.log('Not executed - missing mandatory input params');
    return;
  }
 
  const params = {
    TableName: targetTable,
    Item: item
  };

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log('Success - item added or updated', data);
  } catch (err) {
    console.log('Error', err.stack);
  }
};

export default putItem;
