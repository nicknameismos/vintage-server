'use strict';

/**
 * Module dependencies
 */
var productsPolicy = require('../policies/products.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  products = require('../controllers/products.server.controller');

module.exports = function (app) {
  // Products Routes
  app.route('/api/products').all(core.jwtCheck, productsPolicy.isAllowed)
    .get(products.list);

  app.route('/api/products').all(core.jwtCheck, productsPolicy.isAllowed)
    .post(products.create);

  app.route('/api/products/:productId').all(core.jwtCheck, productsPolicy.isAllowed)
    .get(products.read, products.clearExpire);

  app.route('/api/products/:productId').all(core.jwtCheck, productsPolicy.isAllowed)
    .put(products.isPromotionprice, products.update)
    .delete(products.delete);

  app.route('/api/productsbyshop/:productbyshopId').all(core.jwtCheck, productsPolicy.isAllowed)
    .get(products.cookingProductList, products.productByShop);

  app.route('/api/getproductlistbyshop/:getproductbyshopId').all(core.jwtCheck, productsPolicy.isAllowed)
    .get(products.getListProduct, products.getProductListByShop);

  app.route('/api/customerproductdetail/:productId').all(core.jwtCheck, productsPolicy.isAllowed)
    .get(products.productDetail);

  app.route('/api/products_picture').post(products.changeProductPicture);
  // Finish by binding the Product middleware
  app.param('productId', products.productByID);
  app.param('productbyshopId', products.shopID);
  app.param('getproductbyshopId', products.getShopID);


};
