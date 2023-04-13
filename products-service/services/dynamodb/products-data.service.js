import { ddbDocClient } from './ddb-doc-client.js';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const productsTable = process.env.PRODUCTS_DB_NAME;
const stocksTable = process.env.STOCKS_DB_NAME;

const scanProductsParams = {
  TableName: productsTable
};

const scanStocksParams = {
  TableName: stocksTable
};

const scanTable = async (scanParams) => {
  if (!scanParams) {
    console.log('Table scan cannot be performed due to missing params');
    return;
  }

  const promise = new Promise(async (resolve, reject) => {
    try {
      const data = await ddbDocClient.send(new ScanCommand(scanParams));
      console.log('Successful read from DB: ', data.Items);
      resolve(data.Items);
    } catch (err) {
      console.log('Error', err);
      reject(err);
    }
  });

  return promise;
};

export const getProductItem = async (productId) => {
  const productQueryParams = {
    TableName: productsTable,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {':id': productId}
  };

  const stockQueryParams = {
    TableName: stocksTable,
    KeyConditionExpression: 'product_id = :id',
    ExpressionAttributeValues: { ':id': productId }
  };

  let productInfo = {};

  try {
    const productData = await ddbDocClient.send(
      new QueryCommand(productQueryParams)
    );

    const stockData = await ddbDocClient.send(
      new QueryCommand(stockQueryParams)
    );

    if (productData.Items[0] && stockData.Items[0]) {
      productInfo = productData.Items[0];
      productInfo.count = stockData.Items[0].count;
      
      return productInfo;
    } else {
      return null;
    }
    
  } catch (err) {
    console.log('Error', err);
  }
};

export const getAllProducts = async () => {
  let products = await scanTable(scanProductsParams);
  let productsStock = await scanTable(scanStocksParams);
   
  return products.map(product => {
    const productCount =
      productsStock.find(p => p.product_id === product.id)?.count ?? 0;
    return { ...product, count: productCount };
  });
}