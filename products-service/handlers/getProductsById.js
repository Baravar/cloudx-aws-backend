import { productsMock } from '../__mocks__/productsAPI.js';

export const getProductsById = async (event) => {
    const { productId } = event.pathParameters;
    const products = productsMock;

    let response = {};
    let responseStatusCode = '';
    let responseBody = '';
    let product = {};

    product = products.find((product) => product.id === productId);

    if (product) {
        responseStatusCode = 200;
        responseBody = JSON.stringify(product);
        console.log('Product found: ', product);
    } else {
        responseStatusCode = 422;
        responseBody = `Product with the id [ ${productId} ] not found`;
        console.log(`Product with the id [ ${productId} ] not found`);
    }
   
    response = {
        statusCode: responseStatusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'content-type': 'application/json'
        },
        body: responseBody
    };
    
    return response;
};

export default getProductsById;