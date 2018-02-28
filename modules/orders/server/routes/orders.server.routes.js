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
    .post(orders.updateCoupon, orders.omiseCard, orders.create, core.createNotification);

  app.route('/api/updateorderbid/:orderId').all(core.jwtCheck, ordersPolicy.isAllowed)
    // .put(orders.bidCreate);
    .put(orders.updateCoupon, orders.omiseCard, orders.updateBid, orders.bidCreateOrder);

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

  app.route('/api/getorderdetail/:orderId/:itemId').all(core.jwtCheck, ordersPolicy.isAllowed)
    .get(orders.findShop, orders.cookingOrderDetail, orders.orderDetail);

  app.route('/api/cancelitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.cancel, core.updateNotification);

  app.route('/api/confirmitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.confirm, core.updateNotification);

  app.route('/api/completeitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.complete, core.updateNotification);

  app.route('/api/sentitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.sent, core.updateNotification);

  app.route('/api/rejectitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.reject, core.updateNotification);

  app.route('/api/transferitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.transfer, core.updateNotification);

  app.route('/api/refunditem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.refund, core.updateNotification);

  app.route('/api/getordersbyadmin').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderListAdmin, orders.cookingOrderListAdmin, orders.resOrderListAdmin);

  app.route('/api/admincancelitem').all(core.jwtCheck, ordersPolicy.isAllowed)
    .post(orders.getOrderId, orders.admincancel, core.updateNotification);

  app.route('/api/orderbid')
    .post(orders.getBidId, orders.bidCreate, orders.updateBidId, core.createBidNotification); //, core.createBidNotification
  // Finish by binding the Order middleware
  app.param('orderId', orders.orderByID);
  app.param('orderShopId', orders.orderShopId);
  app.param('itemId', orders.orderItemId);
};
