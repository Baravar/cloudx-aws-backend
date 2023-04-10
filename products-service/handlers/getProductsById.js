import { productsMock } from '../__mocks__/products.mock.js';

export const getProductsById = async event => {
  const { productId } = event.pathParameters;
  const products = await productsMock;

  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'content-type': 'application/json'
  };

  let response = {};
  let responseStatusCode = '';
  let responseBody = '';
  let product = {};

  try {
    product = products.find(product => product.id === productId);

    if (product) {
      responseStatusCode = 200;
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
