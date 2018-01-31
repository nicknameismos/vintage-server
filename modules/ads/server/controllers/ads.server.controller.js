'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Ad = mongoose.model('Ad'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Ad
 */
exports.create = function(req, res) {
  var ad = new Ad(req.body);
  ad.user = req.user;

  ad.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(ad);
    }
  });
};

/**
 * Show the current Ad
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var ad = req.ad ? req.ad.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  ad.isCurrentUserOwner = req.user && ad.user && ad.user._id.toString() === req.user._id.toString();

  res.jsonp(ad);
};

/**
 * Update a Ad
 */
exports.update = function(req, res) {
  var ad = req.ad;

  ad = _.extend(ad, req.body);

  ad.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(ad);
    }
  });
};

/**
 * Delete an Ad
 */
exports.delete = function(req, res) {
  var ad = req.ad;

  ad.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(ad);
    }
  });
};

/**
 * List of Ads
 */
exports.list = function(req, res) {
  Ad.find().sort('-created').populate('user', 'displayName').exec(function(err, ads) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(ads);
    }
  });
};

/**
 * Ad middleware
 */
exports.adByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Ad is invalid'
    });
  }

  Ad.findById(id).populate('user', 'displayName').exec(function (err, ad) {
    if (err) {
      return next(err);
    } else if (!ad) {
      return res.status(404).send({
        message: 'No Ad with that identifier has been found'
      });
    }
    req.ad = ad;
    next();
  });
};
