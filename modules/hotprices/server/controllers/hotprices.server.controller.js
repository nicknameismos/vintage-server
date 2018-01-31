'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Hotprice = mongoose.model('Hotprice'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Hotprice
 */
exports.create = function(req, res) {
  var hotprice = new Hotprice(req.body);
  hotprice.user = req.user;

  hotprice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hotprice);
    }
  });
};

/**
 * Show the current Hotprice
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var hotprice = req.hotprice ? req.hotprice.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  hotprice.isCurrentUserOwner = req.user && hotprice.user && hotprice.user._id.toString() === req.user._id.toString();

  res.jsonp(hotprice);
};

/**
 * Update a Hotprice
 */
exports.update = function(req, res) {
  var hotprice = req.hotprice;

  hotprice = _.extend(hotprice, req.body);

  hotprice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hotprice);
    }
  });
};

/**
 * Delete an Hotprice
 */
exports.delete = function(req, res) {
  var hotprice = req.hotprice;

  hotprice.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hotprice);
    }
  });
};

/**
 * List of Hotprices
 */
exports.list = function(req, res) {
  Hotprice.find().sort('-created').populate('user', 'displayName').exec(function(err, hotprices) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hotprices);
    }
  });
};

/**
 * Hotprice middleware
 */
exports.hotpriceByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Hotprice is invalid'
    });
  }

  Hotprice.findById(id).populate('user', 'displayName').exec(function (err, hotprice) {
    if (err) {
      return next(err);
    } else if (!hotprice) {
      return res.status(404).send({
        message: 'No Hotprice with that identifier has been found'
      });
    }
    req.hotprice = hotprice;
    next();
  });
};
