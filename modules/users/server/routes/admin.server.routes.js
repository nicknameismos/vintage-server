'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app);

  // Users collection routes
  app.route('/api/users')
    .get(core.jwtCheck, adminPolicy.isAllowed, admin.list);

  //User Management
  app.route('/api/management/users')
    .get(core.jwtCheck, adminPolicy.isAllowed, admin.initlist, admin.customer, admin.shopowner, admin.admins, admin.biker, admin.managelist);

  app.route('/api/management/paging/users')
    .post(core.jwtCheck, adminPolicy.isAllowed, admin.setinitpage, admin.tabcustomer, admin.tabshopowner, admin.tabadmins, admin.tabbiker, admin.managelistpage);

  // Single user routes
  app.route('/api/users/:userId')
    .get(core.jwtCheck, adminPolicy.isAllowed, admin.read)
    .put(core.jwtCheck, adminPolicy.isAllowed, admin.update)
    .delete(core.jwtCheck, adminPolicy.isAllowed, admin.delete);

  app.route('/api/getusersbyadmin')
    .post(core.jwtCheck, adminPolicy.isAllowed, admin.getUsersByAdmin, admin.resUsers);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
