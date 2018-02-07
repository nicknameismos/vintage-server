'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Coupon = mongoose.model('Coupon'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Coupon
 */
exports.create = function(req, res) {
  var coupon = new Coupon(req.body);
  coupon.user = req.user;

  coupon.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coupon);
    }
  });
};

/**
 * Show the current Coupon
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var coupon = req.coupon ? req.coupon.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  coupon.isCurrentUserOwner = req.user && coupon.user && coupon.user._id.toString() === req.user._id.toString();

  res.jsonp(coupon);
};

/**
 * Update a Coupon
 */
exports.update = function(req, res) {
  var coupon = req.coupon;

  coupon = _.extend(coupon, req.body);

  coupon.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coupon);
    }
  });
};

/**
 * Delete an Coupon
 */
exports.delete = function(req, res) {
  var coupon = req.coupon;

  coupon.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coupon);
    }
  });
};

/**
 * List of Coupons
 */
exports.list = function(req, res) {
  Coupon.find().sort('-created').populate('user', 'displayName').exec(function(err, coupons) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coupons);
    }
  });
};

/**
 * Coupon middleware
 */
exports.couponByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Coupon is invalid'
    });
  }

  Coupon.findById(id).populate('user', 'displayName').exec(function (err, coupon) {
    if (err) {
      return next(err);
    } else if (!coupon) {
      return res.status(404).send({
        message: 'No Coupon with that identifier has been found'
      });
    }
    req.coupon = coupon;
    next();
  });
};
