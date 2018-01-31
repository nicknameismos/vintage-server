'use strict';

/**
 * Module dependencies
 */
var greetingsPolicy = require('../policies/greetings.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  greetings = require('../controllers/greetings.server.controller');

module.exports = function (app) {
  // Greetings Routes
  app.route('/api/greetings').all(core.jwtCheck, greetingsPolicy.isAllowed)
    .get(greetings.list)
    .post(greetings.create);

  app.route('/api/greetings/:greetingId').all(core.jwtCheck, greetingsPolicy.isAllowed)
    .get(greetings.read)
    .put(greetings.update)
    .delete(greetings.delete);

  // Finish by binding the Greeting middleware
  app.param('greetingId', greetings.greetingByID);
};
