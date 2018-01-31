'use strict';

/**
 * Module dependencies
 */
var categoryproductsPolicy = require('../policies/categoryproducts.server.policy'),
  categoryproducts = require('../controllers/categoryproducts.server.controller'),
  core = require('../../../core/server/controllers/core.server.controller');

module.exports = function (app) {
  // Categoryproducts Routes
  app.route('/api/categoryproducts') //.all(core.jwtCheck, categoryproductsPolicy.isAllowed)
    .get(categoryproducts.list);

  app.route('/api/categoryproducts').all(core.jwtCheck, categoryproductsPolicy.isAllowed)
    .post(categoryproducts.create);

  app.route('/api/categoryproducts/:categoryproductId').all(core.jwtCheck, categoryproductsPolicy.isAllowed)
    .get(categoryproducts.read);

  app.route('/api/categoryproducts/:categoryproductId').all(core.jwtCheck, categoryproductsPolicy.isAllowed)
    .put(categoryproducts.update)
    .delete(categoryproducts.delete);

  app.route('/api/categoryproductsbyshop/:categorybyshopId').all(core.jwtCheck, categoryproductsPolicy.isAllowed)
    .get(categoryproducts.cookingCategoryProductList, categoryproducts.categoryProductByShop);

  // Finish by binding the Categoryproduct middleware
  app.param('categoryproductId', categoryproducts.categoryproductByID);
  app.param('categorybyshopId', categoryproducts.shopID);

};
