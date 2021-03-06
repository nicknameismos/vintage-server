'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Bids Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/bids',
      permissions: '*'
    }, {
      resources: '/api/bids/:bidId',
      permissions: '*'
    }, {
      resources: '/api/getbidlist/:userBidId',
      permissions: '*'
    }, {
      resources: '/api/bidlist',
      permissions: '*'
    }]
  }, {
    roles: ['shop'],
    allows: [{
      resources: '/api/bids',
      permissions: '*'
    }, {
      resources: '/api/bids/:bidId',
      permissions: '*'
    }, {
      resources: '/api/getbidlist/:userBidId',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/bids',
      permissions: ['get', 'post']
    }, {
      resources: '/api/bids/:bidId',
      permissions: ['get']
    }, {
      resources: '/api/getbidlist/:userBidId',
      permissions: ['get']
    }, {
      resources: '/api/biddetail/:bidId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/bids',
      permissions: ['get']
    }, {
      resources: '/api/bids/:bidId',
      permissions: ['get']
    }, {
      resources: '/api/getbidlist/:userBidId',
      permissions: ['get']
    }, {
      resources: '/api/biddetail/:bidId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Bids Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Bid is being processed and the current user created it then allow any manipulation
  if (req.bid && req.user && req.bid.user && req.bid.user.id === req.user.id) {
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
