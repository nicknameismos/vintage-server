'use strict';

/**
 * Module dependencies
 */
var notificationsPolicy = require('../policies/notifications.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  notifications = require('../controllers/notifications.server.controller');

module.exports = function (app) {
  // Notifications Routes
  app.route('/api/notifications').all(core.jwtCheck, notificationsPolicy.isAllowed)
    .get(notifications.list)
    .post(notifications.create);

  app.route('/api/notifications/:notificationId').all(core.jwtCheck, notificationsPolicy.isAllowed)
    .get(notifications.read)
    .put(notifications.update)
    .delete(notifications.delete);

  app.route('/api/userownernotifications').all(core.jwtCheck, notificationsPolicy.isAllowed)
    .get(notifications.listOwner);

  app.route('/api/userownerreadnotification/:notificationId').all(core.jwtCheck, notificationsPolicy.isAllowed)
    .get(notifications.readOwner);
  // Finish by binding the Notification middleware
  app.param('notificationId', notifications.notificationByID);
};
