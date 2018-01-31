'use strict';

/**
 * Module dependencies
 */
var charitysettingsPolicy = require('../policies/charitysettings.server.policy'),
  charitysettings = require('../controllers/charitysettings.server.controller');

module.exports = function(app) {
  // Charitysettings Routes
  app.route('/api/charitysettings').all(charitysettingsPolicy.isAllowed)
    .get(charitysettings.list)
    .post(charitysettings.create);

  app.route('/api/charitysettings/:charitysettingId').all(charitysettingsPolicy.isAllowed)
    .get(charitysettings.read)
    .put(charitysettings.update)
    .delete(charitysettings.delete);

  // Finish by binding the Charitysetting middleware
  app.param('charitysettingId', charitysettings.charitysettingByID);
};
