'use strict';

/**
 * Module dependencies
 */
var userinterestsPolicy = require('../policies/userinterests.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  userinterests = require('../controllers/userinterests.server.controller');

module.exports = function (app) {
  // Userinterests Routes
  app.route('/api/userinterests').all(core.jwtCheck, userinterestsPolicy.isAllowed)
    .get(userinterests.list)
    .post(userinterests.create);

  app.route('/api/userinterests/:userinterestId').all(core.jwtCheck, userinterestsPolicy.isAllowed)
    .get(userinterests.read)
    .put(userinterests.update)
    .delete(userinterests.delete);

  // Finish by binding the Userinterest middleware
  app.param('userinterestId', userinterests.userinterestByID);
};
