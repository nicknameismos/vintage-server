'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Categoryshop = mongoose.model('Categoryshop'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Categoryshop
 */
exports.create = function(req, res) {
  var categoryshop = new Categoryshop(req.body);
  categoryshop.user = req.user;

  categoryshop.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(categoryshop);
    }
  });
};

/**
 * Show the current Categoryshop
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var categoryshop = req.categoryshop ? req.categoryshop.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  categoryshop.isCurrentUserOwner = req.user && categoryshop.user && categoryshop.user._id.toString() === req.user._id.toString();

  res.jsonp(categoryshop);
};

/**
 * Update a Categoryshop
 */
exports.update = function(req, res) {
  var categoryshop = req.categoryshop;

  categoryshop = _.extend(categoryshop, req.body);

  categoryshop.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(categoryshop);
    }
  });
};

/**
 * Delete an Categoryshop
 */
exports.delete = function(req, res) {
  var categoryshop = req.categoryshop;

  categoryshop.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(categoryshop);
    }
  });
};

/**
 * List of Categoryshops
 */
exports.list = function(req, res) {
  Categoryshop.find().sort('created').populate('user', 'displayName').exec(function(err, categoryshops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(categoryshops);
    }
  });
};

/**
 * Categoryshop middleware
 */
exports.categoryshopByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Categoryshop is invalid'
    });
  }

  Categoryshop.findById(id).populate('user', 'displayName').exec(function (err, categoryshop) {
    if (err) {
      return next(err);
    } else if (!categoryshop) {
      return res.status(404).send({
        message: 'No Categoryshop with that identifier has been found'
      });
    }
    req.categoryshop = categoryshop;
    next();
  });
};
