'use strict';

/**
 * Module dependencies
 */
var couponsPolicy = require('../policies/coupons.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  coupons = require('../controllers/coupons.server.controller');

module.exports = function (app) {
  // Coupons Routes
  app.route('/api/coupons').all(core.jwtCheck, couponsPolicy.isAllowed)
    .get(coupons.list)
    .post(coupons.create, coupons.notification);

  app.route('/api/coupons/:couponId').all(core.jwtCheck, couponsPolicy.isAllowed)
    .get(coupons.read)
    .put(coupons.update)
    .delete(coupons.delete);

  app.route('/api/getcouponbycode').all(core.jwtCheck, couponsPolicy.isAllowed)
    .post(coupons.getCouponCode, coupons.wrongCode, coupons.expiredCode, coupons.usedCode, coupons.resCouponCode);

  // Finish by binding the Coupon middleware
  app.param('couponId', coupons.couponByID);
};
