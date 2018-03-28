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
    .post(bids.create, bids.scheduleBid);

  app.route('/api/bids/:bidId').all(core.jwtCheck, bidsPolicy.isAllowed)
    .get(bids.read)
    .put(bids.update, bids.scheduleBid)
    .delete(bids.delete);

  app.route('/api/getbidlist/:userBidId').all(bidsPolicy.isAllowed)
    .get(bids.cookingBid, bids.resBids);

  app.route('/api/biddetail/:bidId').all(bidsPolicy.isAllowed)
    .get(bids.getBidDetail);

  app.route('/api/createBidsScheduleJob')
    .get(bids.createBidsScheduleJob);

  app.route('/api/bidlist').all(core.jwtCheck, bidsPolicy.isAllowed)
    .post(bids.bidStatusActive, bids.bidToday, bids.bidWaiting, bids.bidTopay, bids.bidEnd, bids.bidPaid, bids.countBid, bids.bidList);
  // .post(bids.bidList);
  // Finish by binding the Bid middleware
  app.param('bidId', bids.bidByID);
  app.param('userBidId', bids.userBidId);
};
