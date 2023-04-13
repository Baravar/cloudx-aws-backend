import { getAllProducts } from '../services/dynamodb/products-data.service.js'

export const getProductsList = async event => {
  console.log(event);

  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'content-type': 'application/json'
  };

  let response = {};
  let productsData = {};

  try {
    productsData = await getAllProducts();;
  } catch (error) {
    return response = {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ message: `Internal server error: ${error}` })
    };
  }

  return (response = {
    statusCode: 200,
    headers: defaultHeaders,
    body: JSON.stringify(productsData)
  });
};

export default getProductsList;
