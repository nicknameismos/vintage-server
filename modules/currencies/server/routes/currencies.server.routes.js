'use strict';

/**
 * Module dependencies
 */
var currenciesPolicy = require('../policies/currencies.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  currencies = require('../controllers/currencies.server.controller');

module.exports = function(app) {
  // Currencies Routes
  app.route('/api/currencies').all(core.jwtCheck, currenciesPolicy.isAllowed)
    .get(currencies.list)
    .post(currencies.create);

  app.route('/api/currencies/:currencyId').all(core.jwtCheck, currenciesPolicy.isAllowed)
    .get(currencies.read)
    .put(currencies.update)
    .delete(currencies.delete);

  // Finish by binding the Currency middleware
  app.param('currencyId', currencies.currencyByID);
};
