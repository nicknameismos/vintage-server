'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Coinbalance = mongoose.model('Coinbalance'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Coinbalance
 */
exports.create = function(req, res) {
  var coinbalance = new Coinbalance(req.body);
  coinbalance.user = req.user;

  coinbalance.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coinbalance);
    }
  });
};

/**
 * Show the current Coinbalance
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var coinbalance = req.coinbalance ? req.coinbalance.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  coinbalance.isCurrentUserOwner = req.user && coinbalance.user && coinbalance.user._id.toString() === req.user._id.toString();

  res.jsonp(coinbalance);
};

/**
 * Update a Coinbalance
 */
exports.update = function(req, res) {
  var coinbalance = req.coinbalance;

  coinbalance = _.extend(coinbalance, req.body);

  coinbalance.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coinbalance);
    }
  });
};

/**
 * Delete an Coinbalance
 */
exports.delete = function(req, res) {
  var coinbalance = req.coinbalance;

  coinbalance.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coinbalance);
    }
  });
};

/**
 * List of Coinbalances
 */
exports.list = function(req, res) {
  Coinbalance.find().sort('-created').populate('user', 'displayName').exec(function(err, coinbalances) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coinbalances);
    }
  });
};

/**
 * Coinbalance middleware
 */
exports.coinbalanceByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Coinbalance is invalid'
    });
  }

  Coinbalance.findById(id).populate('user', 'displayName').exec(function (err, coinbalance) {
    if (err) {
      return next(err);
    } else if (!coinbalance) {
      return res.status(404).send({
        message: 'No Coinbalance with that identifier has been found'
      });
    }
    req.coinbalance = coinbalance;
    next();
  });
};
