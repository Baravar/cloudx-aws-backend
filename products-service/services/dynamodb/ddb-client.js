import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { dynamoDbRegion } from '../../constants/product-service.constants.js';
export const ddbClient = new DynamoDBClient({ region: dynamoDbRegion });