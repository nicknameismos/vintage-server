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
    .post(orders.updateCoupon, orders.omiseCard, orders.create);

  app.route('/api/orders/:orderId').all(core.jwtCheck, ordersPolicy.isAllowed)
    .get(orders.read)
    .put(orders.update)
    .delete(orders.delete);

  app.route('/api/payorder/:orderId').all(core.jwtCheck, ordersPolicy.isAllowed)
    .put(orders.omiseCard, orders.update);

  app.route('/api/customergetorders').all(core.jwtCheck, ordersPolicy.isAllowed)
    .get(orders.customerGetListOrder, orders.customerCookingListOrder, orders.resList);

  app.route('/api/shopgetorders/:orderShopId').all(core.jwtCheck, ordersPolicy.isAllowed)
    .get(orders.shopGetListOrder, orders.shopCookingListOrder, orders.resList);

  app.route('/api/getorderdetail/:orderId/:itemId').all(core.jwtCheck, ordersPolicy.isAllowed)
    .get(orders.findShop, orders.cookingOrderDetail, orders.orderDetail);

  app.route('/api/cancelitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.cancel);

  app.route('/api/completeitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.complete);

  app.route('/api/sentitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.sent);

  app.route('/api/rejectitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.reject);

  app.route('/api/transferitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.transfer);

  app.route('/api/refunditem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.refund);

  // Finish by binding the Order middleware
  app.param('orderId', orders.orderByID);
  app.param('orderShopId', orders.orderShopId);
  app.param('itemId', orders.orderItemId);
};
