'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Userinterest = mongoose.model('Userinterest'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Userinterest
 */
exports.create = function(req, res) {
  var userinterest = new Userinterest(req.body);
  userinterest.user = req.user;

  userinterest.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(userinterest);
    }
  });
};

/**
 * Show the current Userinterest
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var userinterest = req.userinterest ? req.userinterest.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  userinterest.isCurrentUserOwner = req.user && userinterest.user && userinterest.user._id.toString() === req.user._id.toString();

  res.jsonp(userinterest);
};

/**
 * Update a Userinterest
 */
exports.update = function(req, res) {
  var userinterest = req.userinterest;

  userinterest = _.extend(userinterest, req.body);

  userinterest.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(userinterest);
    }
  });
};

/**
 * Delete an Userinterest
 */
exports.delete = function(req, res) {
  var userinterest = req.userinterest;

  userinterest.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(userinterest);
    }
  });
};

/**
 * List of Userinterests
 */
exports.list = function(req, res) {
  Userinterest.find().sort('-created').populate('user', 'displayName').populate('shopinterest').populate('promotioninterest').exec(function(err, userinterests) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(userinterests);
    }
  });
};

/**
 * Userinterest middleware
 */
exports.userinterestByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Userinterest is invalid'
    });
  }

  Userinterest.findById(id).populate('user', 'displayName').populate('shopinterest').populate('promotioninterest').exec(function (err, userinterest) {
    if (err) {
      return next(err);
    } else if (!userinterest) {
      return res.status(404).send({
        message: 'No Userinterest with that identifier has been found'
      });
    }
    req.userinterest = userinterest;
    next();
  });
};
