import { getProductsById } from '../getProductsById.js';

const defaultHeaders = {
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': '*',
  'content-type': 'application/json'
};

describe('getProductsById', () => {
  it('should return 200 HTTP response with product data and basic headers', async () => {
    const successRequestEvent = {
      pathParameters: { productId: '7567ec4b-b10c-48c5-9345-fc73c48a80aa' }
    };
    const expectedSuccessData = {
      body: '{"count":4,"size":[],"description":"Home jersey","id":"7567ec4b-b10c-48c5-9345-fc73c48a80aa","price":97.5,"title":"FC Barcelona - Home Kit 22-23","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg8LVzZ5M55E3lBGh0taMRInfQ31iIbrRkZYN-6LCjh4r6pfD-vaxYyhKw0SCDUAnoBlEFyCHSoc9tkr3AjAkXqUD7wMC12AXnFuMU5iFNAPIUMej5_df3qtMvHkk5EfTVrZEfJAUyAFjIjUIoMx4NFMfBEE9ZBEtSzOYSXp99KDbnGSl5zQk1WDSBZ/s1600/barcelona-22-23-home-kit-14.jpg"}',
      headers: defaultHeaders,
      statusCode: 200
    };

    await expect(getProductsById(successRequestEvent)).resolves.toStrictEqual(
      expectedSuccessData
    );
  });

  it('should return 422 HTTP response with error message', async () => {
    const failureRequestEvent = {
      pathParameters: { productId: '7567ec4b-b10c-48c5-9345-fc73c48a80' }
    };
    const expectedFailureData = {
      body: 'Product with the id [ 7567ec4b-b10c-48c5-9345-fc73c48a80 ] not found',
      headers: defaultHeaders,
      statusCode: 422
    };

    await expect(getProductsById(failureRequestEvent)).resolves.toStrictEqual(
      expectedFailureData
    );
  });
});
