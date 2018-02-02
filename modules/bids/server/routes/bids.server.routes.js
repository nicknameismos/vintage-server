'use strict';

/**
 * Module dependencies
 */
var bidsPolicy = require('../policies/bids.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  bids = require('../controllers/bids.server.controller');

module.exports = function (app) {
  // Bids Routes
  app.route('/api/bids').all(core.jwtCheck, bidsPolicy.isAllowed)
    .get(bids.list)
    .post(bids.create);

  app.route('/api/bids/:bidId').all(core.jwtCheck, bidsPolicy.isAllowed)
    .get(bids.read)
    .put(bids.update)
    .delete(bids.delete);

  app.route('/api/getbidlist').all(core.jwtCheck, bidsPolicy.isAllowed)
    .get(bids.cookingBid, bids.resBids);
  // Finish by binding the Bid middleware
  app.param('bidId', bids.bidByID);
};
