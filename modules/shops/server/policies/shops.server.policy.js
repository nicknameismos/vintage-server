'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Shops Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/shops',
      permissions: '*'
    }, {
      resources: '/api/shops/:shopId',
      permissions: '*'
    }, {
      resources: '/api/shops/createusershop/:shopId',
      permissions: '*'
    }, {
      resources: '/api/shops/categories',
      permissions: '*'
    }, {
      resources: '/api/shopshome',
      permissions: '*'
    }, {
      resources: '/api/adminhome',
      permissions: '*'
    }, {
      resources: '/api/filtershop',
      permissions: '*'
    }, {
      resources: '/api/changecover/:shopId',
      permissions: '*'
    }, {
      resources: '/api/addpromote/:shopId',
      permissions: '*'
    }, {
      resources: '/api/manageshop/:shopId',
      permissions: '*'
    }, {
      resources: '/api/createcate/:shopId',
      permissions: '*'
    }, {
      resources: '/api/createproduct/:shopId',
      permissions: '*'
    }, {
      resources: '/api/getshopsname',
      permissions: '*'
    }, {
      resources: '/api/deleteproduct/:shopId',
      permissions: '*'
    }, {
      resources: '/api/checkshopbyname',
      permissions: '*'
    }, {
      resources: '/api/deletecateproduct/:shopId',
      permissions: '*'
    }, {
      resources: '/api/removepromote/:shopId',
      permissions: '*'
    }, {
      resources: '/api/updateitems/:shopId',
      permissions: '*'
    }, {
      resources: '/api/customershopdetail/:shopId',
      permissions: '*'
    }, {
      resources: '/api/searchkeyword',
      permissions: '*'
    }, {
      resources: '/api/getshoplist/:shoppage',
      permissions: '*'
    }]
  }, {
    roles: ['shop'],
    allows: [{
      resources: '/api/shops',
      permissions: '*'
    }, {
      resources: '/api/shops/:shopId',
      permissions: '*'
    }, {
      resources: '/api/shops/createusershop/:shopId',
      permissions: '*'
    }, {
      resources: '/api/shops/categories',
      permissions: '*'
    }, {
      resources: '/api/shopshome',
      permissions: '*'
    }, {
      resources: '/api/changecover/:shopId',
      permissions: '*'
    }, {
      resources: '/api/addpromote/:shopId',
      permissions: '*'
    }, {
      resources: '/api/createcate/:shopId',
      permissions: '*'
    }, {
      resources: '/api/createproduct/:shopId',
      permissions: '*'
    }, {
      resources: '/api/manageshop/:shopId',
      permissions: '*'
    }, {
      resources: '/api/manageshopinfo',
      permissions: '*'
    }, {
      resources: '/api/deleteproduct/:shopId',
      permissions: '*'
    }, {
      resources: '/api/checkshopbyname',
      permissions: '*'
    }, {
      resources: '/api/deletecateproduct/:shopId',
      permissions: '*'
    }, {
      resources: '/api/removepromote/:shopId',
      permissions: '*'
    }, {
      resources: '/api/updateitems/:shopId',
      permissions: '*'
    }, {
      resources: '/api/customershopdetail/:shopId',
      permissions: '*'
    }, {
      resources: '/api/searchkeyword',
      permissions: '*'
    }, {
      resources: '/api/getshoplist/:shoppage',
      permissions: ['GET']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/shops',
      permissions: ['get', 'post']
    }, {
      resources: '/api/shops/:shopId',
      permissions: ['get']
    }, {
      resources: '/api/shops/categories',
      permissions: ['get', 'post']
    }, {
      resources: '/api/customerhome',
      permissions: ['get']
    }, {
      resources: '/api/getshopsname',
      permissions: ['get']
    }, {
      resources: '/api/checkshopbyname',
      permissions: '*'
    }, {
      resources: '/api/customershopdetail/:shopId',
      permissions: '*'
    }, {
      resources: '/api/searchkeyword',
      permissions: '*'
    }, {
      resources: '/api/getshoplist/:shoppage',
      permissions: ['GET']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/shops',
      permissions: ['get']
    }, {
      resources: '/api/shops/:shopId',
      permissions: ['get']
    }, {
      resources: '/api/shops/categories',
      permissions: ['get']
    }, {
      resources: '/api/customerhome',
      permissions: ['get']
    }, {
      resources: '/api/customershopdetail/:shopId',
      permissions: ['get']
    }, {
      resources: '/api/searchkeyword',
      permissions: '*'
    }, {
      resources: '/api/getshoplist/:shoppage',
      permissions: ['GET']
    }]
  }]);
};

/**
 * Check If Shops Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Shop is being processed and the current user created it then allow any manipulation
  if (req.shop && req.user && req.shop.user && req.shop.user.id === req.user.id) {
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
