import { getProductItem } from '../services/dynamodb/products-data.service.js';

export const getProductsById = async event => {
  console.log(event);

  const { productId } = event.pathParameters;

  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'content-type': 'application/json'
  };

  let response = {};
  let responseStatusCode = 200;
  let responseBody = '';

  try {
    const product = await getProductItem(productId);

    if (product) {
      responseBody = JSON.stringify(product);
    } else {
      responseStatusCode = 422;
      responseBody = `Product with the id [ ${productId} ] not found`;
    }
  } catch (error) {
    return response = {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ message: `Internal server error: ${error}` })
    };
  }

  return response = {
    statusCode: responseStatusCode,
    headers: defaultHeaders,
    body: responseBody
  };
};

export default getProductsById;
