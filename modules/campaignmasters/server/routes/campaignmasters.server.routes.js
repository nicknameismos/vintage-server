'use strict';

/**
 * Module dependencies
 */
var campaignmastersPolicy = require('../policies/campaignmasters.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  campaignmasters = require('../controllers/campaignmasters.server.controller');

module.exports = function (app) {
  // Campaignmasters Routes
  app.route('/api/campaignmasters').all(core.jwtCheck, campaignmastersPolicy.isAllowed)
    .get(campaignmasters.list)
    .post(campaignmasters.create);

  app.route('/api/campaignmasters/:campaignmasterId').all(core.jwtCheck, campaignmastersPolicy.isAllowed)
    .get(campaignmasters.read)
    .put(campaignmasters.update)
    .delete(campaignmasters.delete);

  // Finish by binding the Campaignmaster middleware
  app.param('campaignmasterId', campaignmasters.campaignmasterByID);
};
