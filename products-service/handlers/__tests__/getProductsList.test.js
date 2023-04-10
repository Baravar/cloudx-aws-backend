import { getProductsList } from '../getProductsList.js';

describe('getProductsList', () => {
  const expectedData = {
    body: '[{"count":4,"size":[],"description":"Home jersey","id":"7567ec4b-b10c-48c5-9345-fc73c48a80aa","price":97.5,"title":"FC Barcelona - Home Kit 22-23","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg8LVzZ5M55E3lBGh0taMRInfQ31iIbrRkZYN-6LCjh4r6pfD-vaxYyhKw0SCDUAnoBlEFyCHSoc9tkr3AjAkXqUD7wMC12AXnFuMU5iFNAPIUMej5_df3qtMvHkk5EfTVrZEfJAUyAFjIjUIoMx4NFMfBEE9ZBEtSzOYSXp99KDbnGSl5zQk1WDSBZ/s1600/barcelona-22-23-home-kit-14.jpg"},{"count":6,"size":["S","M"],"description":"Away jersey","id":"7567ec4b-b10c-48c5-9345-fc73c48a80a0","price":80,"title":"FC Barcelona - Away Kit 22-23","image":"https://down-my.img.susercontent.com/file/sg-11134201-23020-zczs0z6pxcnv88"},{"count":7,"size":["S","M","XL"],"description":"Home jersey","id":"7567ec4b-b10c-48c5-9345-fc73c48a80a2","price":2,"title":"FC Man City - Home Kit 22-23","image":"https://shop.mancity.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog-MAN/default/dw96c87297/images/large/701221508001_pp_01_mcfc.png?sw=1600&sh=1600&sm=fit"},{"count":12,"size":["M","L"],"description":"Home jersey","id":"7567ec4b-b10c-48c5-9345-fc73c48a80a1","price":5,"title":"Argentina - Home Kit 22-23","image":"https://cf.ijersey.ru/upload/ttmall/img/20221223/c183dcf922d37aa92eabe3a4516928a7.png=z-0,0_f-webp"}]',
    headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': '*',
      'content-type': 'application/json'
    },
    statusCode: 200
  };
  it('should return HTTP response with products data and basic headers', async () => {
    await expect(getProductsList()).resolves.toStrictEqual(expectedData);
  });
});
