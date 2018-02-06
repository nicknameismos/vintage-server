'use strict';

/**
 * Module dependencies
 */
var shippingmastersPolicy = require('../policies/shippingmasters.server.policy'),
  shippingmasters = require('../controllers/shippingmasters.server.controller');

module.exports = function(app) {
  // Shippingmasters Routes
  app.route('/api/shippingmasters').all(shippingmastersPolicy.isAllowed)
    .get(shippingmasters.list)
    .post(shippingmasters.create);

  app.route('/api/shippingmasters/:shippingmasterId').all(shippingmastersPolicy.isAllowed)
    .get(shippingmasters.read)
    .put(shippingmasters.update)
    .delete(shippingmasters.delete);

  // Finish by binding the Shippingmaster middleware
  app.param('shippingmasterId', shippingmasters.shippingmasterByID);
};
