'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shippingmaster = mongoose.model('Shippingmaster'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Shippingmaster
 */
exports.create = function(req, res) {
  var shippingmaster = new Shippingmaster(req.body);
  shippingmaster.user = req.user;

  shippingmaster.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shippingmaster);
    }
  });
};

/**
 * Show the current Shippingmaster
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var shippingmaster = req.shippingmaster ? req.shippingmaster.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  shippingmaster.isCurrentUserOwner = req.user && shippingmaster.user && shippingmaster.user._id.toString() === req.user._id.toString();

  res.jsonp(shippingmaster);
};

/**
 * Update a Shippingmaster
 */
exports.update = function(req, res) {
  var shippingmaster = req.shippingmaster;

  shippingmaster = _.extend(shippingmaster, req.body);

  shippingmaster.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shippingmaster);
    }
  });
};

/**
 * Delete an Shippingmaster
 */
exports.delete = function(req, res) {
  var shippingmaster = req.shippingmaster;

  shippingmaster.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shippingmaster);
    }
  });
};

/**
 * List of Shippingmasters
 */
exports.list = function(req, res) {
  Shippingmaster.find().sort('-created').populate('user', 'displayName').exec(function(err, shippingmasters) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shippingmasters);
    }
  });
};

/**
 * Shippingmaster middleware
 */
exports.shippingmasterByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shippingmaster is invalid'
    });
  }

  Shippingmaster.findById(id).populate('user', 'displayName').exec(function (err, shippingmaster) {
    if (err) {
      return next(err);
    } else if (!shippingmaster) {
      return res.status(404).send({
        message: 'No Shippingmaster with that identifier has been found'
      });
    }
    req.shippingmaster = shippingmaster;
    next();
  });
};
