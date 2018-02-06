'use strict';

/**
 * Module dependencies
 */
var shippingmastersPolicy = require('../policies/shippingmasters.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  shippingmasters = require('../controllers/shippingmasters.server.controller');

module.exports = function (app) {
  // Shippingmasters Routes
  app.route('/api/shippingmasters').all(core.jwtCheck, shippingmastersPolicy.isAllowed)
    .get(shippingmasters.list)
    .post(shippingmasters.create);

  app.route('/api/shippingmasters/:shippingmasterId').all(core.jwtCheck, shippingmastersPolicy.isAllowed)
    .get(shippingmasters.read)
    .put(shippingmasters.update)
    .delete(shippingmasters.delete);

  // Finish by binding the Shippingmaster middleware
  app.param('shippingmasterId', shippingmasters.shippingmasterByID);
};
