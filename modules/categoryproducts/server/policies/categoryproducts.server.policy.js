'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Categoryproducts Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/categoryproducts',
      permissions: '*'
    }, {
      resources: '/api/categoryproducts/:categoryproductId',
      permissions: '*'
    }, {
      resources: '/api/categoryproductsbyshop/:categorybyshopId',
      permissions: '*'
    }]
  },{
    roles: ['shop'],
    allows: [{
      resources: '/api/categoryproducts',
      permissions: '*'
    }, {
      resources: '/api/categoryproducts/:categoryproductId',
      permissions: '*'
    }, {
      resources: '/api/categoryproductsbyshop/:categorybyshopId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/categoryproducts',
      permissions: ['get', 'post']
    }, {
      resources: '/api/categoryproducts/:categoryproductId',
      permissions: ['get']
    }, {
      resources: '/api/categoryproductsbyshop/:categorybyshopId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/categoryproducts',
      permissions: ['get']
    }, {
      resources: '/api/categoryproducts/:categoryproductId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Categoryproducts Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Categoryproduct is being processed and the current user created it then allow any manipulation
  if (req.categoryproduct && req.user && req.categoryproduct.user && req.categoryproduct.user.id === req.user.id) {
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
