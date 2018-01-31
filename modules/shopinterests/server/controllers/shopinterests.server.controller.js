'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shopinterest = mongoose.model('Shopinterest'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Shopinterest
 */
exports.create = function(req, res) {
  var shopinterest = new Shopinterest(req.body);
  shopinterest.user = req.user;

  shopinterest.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shopinterest);
    }
  });
};

/**
 * Show the current Shopinterest
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var shopinterest = req.shopinterest ? req.shopinterest.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  shopinterest.isCurrentUserOwner = req.user && shopinterest.user && shopinterest.user._id.toString() === req.user._id.toString();

  res.jsonp(shopinterest);
};

/**
 * Update a Shopinterest
 */
exports.update = function(req, res) {
  var shopinterest = req.shopinterest;

  shopinterest = _.extend(shopinterest, req.body);

  shopinterest.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shopinterest);
    }
  });
};

/**
 * Delete an Shopinterest
 */
exports.delete = function(req, res) {
  var shopinterest = req.shopinterest;

  shopinterest.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shopinterest);
    }
  });
};

/**
 * List of Shopinterests
 */
exports.list = function(req, res) {
  Shopinterest.find().sort('-created').populate('user', 'displayName').exec(function(err, shopinterests) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({
        titleTH:'ประเภทร้านค้า',
        titleEN:'Shop type',
        items:shopinterests
      });
    }
  });
};

/**
 * Shopinterest middleware
 */
exports.shopinterestByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shopinterest is invalid'
    });
  }

  Shopinterest.findById(id).populate('user', 'displayName').exec(function (err, shopinterest) {
    if (err) {
      return next(err);
    } else if (!shopinterest) {
      return res.status(404).send({
        message: 'No Shopinterest with that identifier has been found'
      });
    }
    req.shopinterest = shopinterest;
    next();
  });
};
