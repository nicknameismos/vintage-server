'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Categoryshops Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/categoryshops',
      permissions: '*'
    }, {
      resources: '/api/categoryshops/:categoryshopId',
      permissions: '*'
    }]
  }, {
    roles: ['shop'],
    allows: [{
      resources: '/api/categoryshops',
      permissions: ['get']
    }, {
      resources: '/api/categoryshops/:categoryshopId',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/categoryshops',
      permissions: ['get']
    }, {
      resources: '/api/categoryshops/:categoryshopId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/categoryshops',
      permissions: ['get']
    }, {
      resources: '/api/categoryshops/:categoryshopId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Categoryshops Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Categoryshop is being processed and the current user created it then allow any manipulation
  if (req.categoryshop && req.user && req.categoryshop.user && req.categoryshop.user.id === req.user.id) {
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
