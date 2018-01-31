'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  config = require(path.resolve('./config/config')),
  _ = require('lodash'),
  jwt = require('jsonwebtoken'),
  Benefitsetting = mongoose.model('Benefitsetting'),
  Coinbalance = mongoose.model('Coinbalance'),
  User = mongoose.model('User');

var secret = 'keepitquiet';
// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];


/**
 * Signup
 */
exports.signup = function (req, res, next) {
  // For security measurement we remove the roles from the req.body object
  // delete req.body.roles;

  // // Init Variables
  var user = new User(req.body);
  var message = null;

  // // Add missing user fields
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;

  // Then save the user
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;
      user.loginToken = "";
      user.loginToken = jwt.sign(_.omit(user, 'password'), config.jwt.secret, { expiresIn: 2 * 60 * 60 * 1000 });
      user.loginExpires = Date.now() + (2 * 60 * 60 * 1000); // 2 hours

      req.login(user, function (err, resp) {
        if (err) {
          res.status(400).send(err);
        } else {

          if (user.roles.indexOf('user') !== -1) {
            req.user = user;
            next();
          } else {
            res.json(user);
          }

        }
      });
    }
  });
};

/**
 * Get New Register Reward
 */
exports.getnewregisterreward = function (req, res, next) {
  var user = req.user;
  Benefitsetting.findOne({name: 'newreg'}).sort('-created').exec(function (err, benefit) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var coinbalance = new Coinbalance({
        name: benefit.name,
        balancetype: 'in',
        volume: benefit.items[0].volume,
        refbenefit: benefit,
        user: user
      });
      coinbalance.save(function(errsave){
        if(errsave){
          return res.status(400).send({
            message: errorHandler.getErrorMessage(errsave)
          });
        }else{
          var resuser = {
            _id: user._id,
            created: user.created,
            displayName: user.displayName,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            notificationids: user.notificationids,
            profileImageURL: user.profileImageURL,
            provider: user.provider,
            roles: user.roles,
            username: user.username,
            loginToken: user.loginToken,
            newregisterreward: {
              items: [{
                image: benefit.image,
                description: benefit.description
              }
              ]
            }
          };
          res.json(resuser);
        }
      });
      
    }
  });
  
};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {

  if (req.body.facebookLogin ? req.body.facebookLogin : false) {
    User.findOne({
      'email': req.body.facebookData.email
    }).exec(function (err, user) { //facebook login process
      if (err) {
        res.status(400).send(err);
      } else {
        if (user) {
          user.password = undefined;
          user.salt = undefined;
          user.loginToken = "";
          user.loginToken = jwt.sign(_.omit(user, 'password'), config.jwt.secret, { expiresIn: 2 * 60 * 60 * 1000 });
          user.loginExpires = Date.now() + (2 * 60 * 60 * 1000); // 2 hours

          req.login(user, function (err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.json(user);
            }
          });
        } else { //register


          user = new User({
            displayName: req.body.facebookData.name,
            email: req.body.facebookData.email ? req.body.facebookData.email : req.body.facebookData.id + '@gmail.com',
            username: req.body.facebookData.email ? req.body.facebookData.email : req.body.facebookData.id,
            provider: 'facebook'
          });

          user.save(function (err, user) {
            if (err) {
              res.status(400).send(err);
            } else {
              user.password = undefined;
              user.salt = undefined;
              user.loginToken = "";
              user.loginToken = jwt.sign(_.omit(user, 'password'), config.jwt.secret, { expiresIn: 2 * 60 * 60 * 1000 });
              user.loginExpires = Date.now() + (2 * 60 * 60 * 1000);
              res.json(user);
            }
          });
        }
      }
    });
  } else {
    passport.authenticate('local', function (err, user, info) {
      if (err || !user) {
        res.status(400).send(info);
      } else {
        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;
        // add token and exp date to user object
        user.loginToken = "";
        user.loginToken = jwt.sign(_.omit(user, 'password'), config.jwt.secret, { expiresIn: 2 * 60 * 60 * 1000 });
        user.loginExpires = Date.now() + (2 * 60 * 60 * 1000); // 2 hours


        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    })(req, res, next);
  }
};



/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    // Set redirection path on session.
    // Do not redirect to a signin or signup page
    if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
      req.session.redirect_to = req.query.redirect_to;
    }
    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
  return function (req, res, next) {
    // Pop redirect URL from session
    var sessionRedirectURL = req.session.redirect_to;
    delete req.session.redirect_to;

    passport.authenticate(strategy, function (err, user, redirectURL) {
      if (err) {
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/authentication/signin');
      }
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(redirectURL || sessionRedirectURL || '/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query fields
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, function (err, user) {
      if (err) {
        return done(err);
      } else {
        if (!user) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

          User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
            user = new User({
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              email: providerUserProfile.email,
              profileImageURL: providerUserProfile.profileImageURL,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData
            });

            // And save the user
            user.save(function (err) {
              return done(err, user);
            });
          });
        } else {
          return done(err, user);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, '/settings/accounts');
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
  var user = req.user;
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};

exports.usermanage = function (req, res) {
  var _user = req.body;
  var user = req.profile;
  user.firstName = _user.firstName ? _user.firstName : user.firstName;
  user.lastName = _user.lastName ? _user.lastName : user.lastName;
  user.displayName = _user.firstName + ' ' + _user.lastName;
  user.profileImageURL = _user.profileImageURL ? _user.profileImageURL : user.profileImageURL;
  user.dateOfBirth = _user.dateOfBirth ? _user.dateOfBirth : user.dateOfBirth;
  user.citizenid = _user.citizenid ? _user.citizenid : user.citizenid;
  user.bankaccount = _user.bankaccount ? _user.bankaccount : user.bankaccount;

  user.save(function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(user);
    }
  });
};