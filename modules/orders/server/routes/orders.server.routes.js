'use strict';

/**
 * Module dependencies
 */
var ordersPolicy = require('../policies/orders.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  orders = require('../controllers/orders.server.controller');

module.exports = function (app) {
  // Orders Routes
  app.route('/api/orders').all(core.jwtCheck, ordersPolicy.isAllowed)
    .get(orders.list)
    .post(orders.omiseCard, orders.create);

  app.route('/api/orders/:orderId').all(core.jwtCheck, ordersPolicy.isAllowed)
    .get(orders.read)
    .put(orders.update)
    .delete(orders.delete);

  app.route('/api/payorder/:orderId').all(core.jwtCheck, ordersPolicy.isAllowed)
    .put(orders.omiseCard, orders.update);

  // Finish by binding the Order middleware
  app.param('orderId', orders.orderByID);
};
