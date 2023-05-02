import { SNSClient } from '@aws-sdk/client-sns';
import { snsRegion } from '../../constants/product-service.constants.js';

const snsClient = new SNSClient({ region: snsRegion });

export { snsClient };
