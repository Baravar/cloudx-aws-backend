import { productsMock } from '../__mocks__/productsAPI.js';

export const getProductsList = async () => {
    let response = {};

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'content-type': 'application/json'
        },
        body: JSON.stringify({products: productsMock})
    };
    
    return response;
};

export default getProductsList;