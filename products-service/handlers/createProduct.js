import putItem from '../services/dynamodb/ddb-method-put-item.js';
import { v4 as uuidv4 } from 'uuid';

export const createProduct = async event => {
  console.log(event);

  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'content-type': 'application/json'
  };

  const STOCKS_DB = process.env.STOCKS_DB_NAME;
  const PRODUCTS_DB = process.env.PRODUCTS_DB_NAME;
  const payloadData  = JSON.parse(event.body);

  let response = {};
  let responseStatusCode = 200;
  let responseBody = '';

  const props = ['title', 'description', 'size', 'price', 'image', 'count'];
  const missedFromSchema = props.find(
    prop => !payloadData.hasOwnProperty(prop)
  );


  if (!payloadData || missedFromSchema) {
    responseStatusCode = 400;
    responseBody = JSON.stringify({
      message:
        `This request is missing payload or required field - ${missedFromSchema}`
    });
  } else {
    const uniqueProductId = uuidv4();
    const productsItemPayload = {
      id: uniqueProductId,
      title: payloadData.title,
      description: payloadData.description || '',
      image: payloadData.image || '',
      price: payloadData.price || 0,
      size: payloadData.size || []
    };

    const stocksItemPayload = {
      product_id: uniqueProductId,
      count: Number(payloadData.count) || 0
    };

    try {
      await putItem(PRODUCTS_DB, productsItemPayload);
      await putItem(STOCKS_DB, stocksItemPayload);

      responseBody = JSON.stringify(
        `Product with ID [ ${uniqueProductId} ] has been added`
      );
    } catch (error) {
      return (response = {
        statusCode: 500,
        headers: defaultHeaders,
        body: JSON.stringify({
          message: `Internal server error - could not write into DB: ${error}`
        })
      });
    }
  } 

  return response = {
    statusCode: responseStatusCode,
    headers: defaultHeaders,
    body: responseBody
  };
};

export default createProduct;
