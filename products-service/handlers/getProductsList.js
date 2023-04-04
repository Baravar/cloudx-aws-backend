import { productsMock } from '../__mocks__/products.mock.js';

export const getProductsList = async () => {
  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'content-type': 'application/json'
  };

  let response = {};
  let data = {};

  try {
    data = await productsMock;
  } catch (error) {
    return response = {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ message: `Internal server error: ${error}` })
    };
  }

  return response = {
    statusCode: 200,
    headers: defaultHeaders,
    body: JSON.stringify(data)
  };
};

export default getProductsList;
