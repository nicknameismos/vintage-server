'use strict';

/**
 * Module dependencies
 */
var hotpricesPolicy = require('../policies/hotprices.server.policy'),
  hotprices = require('../controllers/hotprices.server.controller');

module.exports = function(app) {
  // Hotprices Routes
  app.route('/api/hotprices').all(hotpricesPolicy.isAllowed)
    .get(hotprices.list)
    .post(hotprices.create);

  app.route('/api/hotprices/:hotpriceId').all(hotpricesPolicy.isAllowed)
    .get(hotprices.read)
    .put(hotprices.update)
    .delete(hotprices.delete);

  // Finish by binding the Hotprice middleware
  app.param('hotpriceId', hotprices.hotpriceByID);
};
