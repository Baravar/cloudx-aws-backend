import putItem from '../services/dynamodb/ddb-method-put-item.js';
import { productsMock } from '../__mocks__/products.mock.js';
import { v4 as uuidv4 } from 'uuid';

(async () => {
  const PRODUCTS_DB = process.env.PRODUCTS_DB_NAME;
  const STOCKS_DB = process.env.STOCKS_DB_NAME;
  const products = await productsMock;

  products.forEach(mockItem => {
    const uniqueProductId = uuidv4();

    const productsItemPayload = {
      id: uniqueProductId,
      title: mockItem.title,
      description: mockItem.description,
      image: mockItem.image,
      price: mockItem.price,
      size: mockItem.size
    };

    const stocksItemPayload = {
      product_id: uniqueProductId,
      count: mockItem.count
    };

    putItem(PRODUCTS_DB, productsItemPayload);
    putItem(STOCKS_DB, stocksItemPayload);
  });
})()



