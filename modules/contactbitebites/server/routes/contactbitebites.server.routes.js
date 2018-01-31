'use strict';

/**
 * Module dependencies
 */
var contactbitebitesPolicy = require('../policies/contactbitebites.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  contactbitebites = require('../controllers/contactbitebites.server.controller');

module.exports = function (app) {
  // Contactbitebites Routes
  app.route('/api/contactbitebites').all(core.jwtCheck, contactbitebitesPolicy.isAllowed)
    .get(contactbitebites.list)
    .post(contactbitebites.create);

  app.route('/api/contactbitebites/:contactbitebiteId').all(core.jwtCheck, contactbitebitesPolicy.isAllowed)
    .get(contactbitebites.read)
    .put(contactbitebites.update)
    .delete(contactbitebites.delete);

  // Finish by binding the Contactbitebite middleware
  app.param('contactbitebiteId', contactbitebites.contactbitebiteByID);
};
