'use strict';

/**
 * Module dependencies
 */
var contactchoicesPolicy = require('../policies/contactchoices.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  contactchoices = require('../controllers/contactchoices.server.controller');

module.exports = function (app) {
  // Contactchoices Routes
  app.route('/api/contactchoices').all(core.jwtCheck, contactchoicesPolicy.isAllowed)
    .get(contactchoices.list)
    .post(contactchoices.create);

  app.route('/api/contactchoices/:contactchoiceId').all(core.jwtCheck, contactchoicesPolicy.isAllowed)
    .get(contactchoices.read)
    .put(contactchoices.update)
    .delete(contactchoices.delete);

  // Finish by binding the Contactchoice middleware
  app.param('contactchoiceId', contactchoices.contactchoiceByID);
};
