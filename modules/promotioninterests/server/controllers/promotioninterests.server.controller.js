'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Promotioninterest = mongoose.model('Promotioninterest'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Promotioninterest
 */
exports.create = function(req, res) {
  var promotioninterest = new Promotioninterest(req.body);
  promotioninterest.user = req.user;

  promotioninterest.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(promotioninterest);
    }
  });
};

/**
 * Show the current Promotioninterest
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var promotioninterest = req.promotioninterest ? req.promotioninterest.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  promotioninterest.isCurrentUserOwner = req.user && promotioninterest.user && promotioninterest.user._id.toString() === req.user._id.toString();

  res.jsonp(promotioninterest);
};

/**
 * Update a Promotioninterest
 */
exports.update = function(req, res) {
  var promotioninterest = req.promotioninterest;

  promotioninterest = _.extend(promotioninterest, req.body);

  promotioninterest.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(promotioninterest);
    }
  });
};

/**
 * Delete an Promotioninterest
 */
exports.delete = function(req, res) {
  var promotioninterest = req.promotioninterest;

  promotioninterest.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(promotioninterest);
    }
  });
};

/**
 * List of Promotioninterests
 */
exports.list = function(req, res) {
  Promotioninterest.find().sort('-created').populate('user', 'displayName').exec(function(err, promotioninterests) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({
        titleTH:'ประเภทโปรโมชั่น',
        titleEN:'Promotion type',
        items:promotioninterests
      });
    }
  });
};

/**
 * Promotioninterest middleware
 */
exports.promotioninterestByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Promotioninterest is invalid'
    });
  }

  Promotioninterest.findById(id).populate('user', 'displayName').exec(function (err, promotioninterest) {
    if (err) {
      return next(err);
    } else if (!promotioninterest) {
      return res.status(404).send({
        message: 'No Promotioninterest with that identifier has been found'
      });
    }
    req.promotioninterest = promotioninterest;
    next();
  });
};
