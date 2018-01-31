'use strict';

/**
 * Module dependencies
 */
var promotioninterestsPolicy = require('../policies/promotioninterests.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  promotioninterests = require('../controllers/promotioninterests.server.controller');

module.exports = function (app) {
  // Promotioninterests Routes
  app.route('/api/promotioninterests').all(core.jwtCheck, promotioninterestsPolicy.isAllowed)
    .get(promotioninterests.list)
    .post(promotioninterests.create);

  app.route('/api/promotioninterests/:promotioninterestId').all(core.jwtCheck, promotioninterestsPolicy.isAllowed)
    .get(promotioninterests.read)
    .put(promotioninterests.update)
    .delete(promotioninterests.delete);

  // Finish by binding the Promotioninterest middleware
  app.param('promotioninterestId', promotioninterests.promotioninterestByID);
};
