'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Notifications Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/notifications',
      permissions: '*'
    }, {
      resources: '/api/notifications/:notificationId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/notifications',
      permissions: ['get', 'post']
    }, {
      resources: '/api/notifications/:notificationId',
      permissions: ['*']
    }, {
      resources: '/api/userownernotifications',
      permissions: ['get']
    }, {
      resources: '/api/userownerreadnotification/:notificationId',
      permissions: ['get']
    }]
  }, {
    roles: ['shop'],
    allows: [{
      resources: '/api/notifications',
      permissions: ['get', 'post']
    }, {
      resources: '/api/notifications/:notificationId',
      permissions: ['get']
    }, {
      resources: '/api/userownernotifications',
      permissions: ['get']
    }, {
      resources: '/api/userownerreadnotification/:notificationId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/notifications',
      permissions: ['get']
    }, {
      resources: '/api/notifications/:notificationId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Notifications Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Notification is being processed and the current user created it then allow any manipulation
  if (req.notification && req.user && req.notification.user && req.notification.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
