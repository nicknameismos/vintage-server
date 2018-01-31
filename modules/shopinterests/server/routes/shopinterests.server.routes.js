'use strict';

/**
 * Module dependencies
 */
var shopinterestsPolicy = require('../policies/shopinterests.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  shopinterests = require('../controllers/shopinterests.server.controller');

module.exports = function (app) {
  // Shopinterests Routes
  app.route('/api/shopinterests').all(core.jwtCheck, shopinterestsPolicy.isAllowed)
    .get(shopinterests.list)
    .post(shopinterests.create);

  app.route('/api/shopinterests/:shopinterestId').all(core.jwtCheck, shopinterestsPolicy.isAllowed)
    .get(shopinterests.read)
    .put(shopinterests.update)
    .delete(shopinterests.delete);

  // Finish by binding the Shopinterest middleware
  app.param('shopinterestId', shopinterests.shopinterestByID);
};
