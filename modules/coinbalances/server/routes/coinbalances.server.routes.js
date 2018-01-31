'use strict';

/**
 * Module dependencies
 */
var coinbalancesPolicy = require('../policies/coinbalances.server.policy'),
  coinbalances = require('../controllers/coinbalances.server.controller');

module.exports = function(app) {
  // Coinbalances Routes
  app.route('/api/coinbalances').all(coinbalancesPolicy.isAllowed)
    .get(coinbalances.list)
    .post(coinbalances.create);

  app.route('/api/coinbalances/:coinbalanceId').all(coinbalancesPolicy.isAllowed)
    .get(coinbalances.read)
    .put(coinbalances.update)
    .delete(coinbalances.delete);

  // Finish by binding the Coinbalance middleware
  app.param('coinbalanceId', coinbalances.coinbalanceByID);
};
