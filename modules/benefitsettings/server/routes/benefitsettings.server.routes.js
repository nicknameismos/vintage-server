'use strict';

/**
 * Module dependencies
 */
var benefitsettingsPolicy = require('../policies/benefitsettings.server.policy'),
  benefitsettings = require('../controllers/benefitsettings.server.controller');

module.exports = function(app) {
  // Benefitsettings Routes
  app.route('/api/benefitsettings').all(benefitsettingsPolicy.isAllowed)
    .get(benefitsettings.list)
    .post(benefitsettings.create);

  app.route('/api/benefitsettings/:benefitsettingId').all(benefitsettingsPolicy.isAllowed)
    .get(benefitsettings.read)
    .put(benefitsettings.update)
    .delete(benefitsettings.delete);

  // Finish by binding the Benefitsetting middleware
  app.param('benefitsettingId', benefitsettings.benefitsettingByID);
};
