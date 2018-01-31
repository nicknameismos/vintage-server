'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Benefitsetting = mongoose.model('Benefitsetting'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Benefitsetting
 */
exports.create = function(req, res) {
  var benefitsetting = new Benefitsetting(req.body);
  benefitsetting.user = req.user;

  benefitsetting.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(benefitsetting);
    }
  });
};

/**
 * Show the current Benefitsetting
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var benefitsetting = req.benefitsetting ? req.benefitsetting.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  benefitsetting.isCurrentUserOwner = req.user && benefitsetting.user && benefitsetting.user._id.toString() === req.user._id.toString();

  res.jsonp(benefitsetting);
};

/**
 * Update a Benefitsetting
 */
exports.update = function(req, res) {
  var benefitsetting = req.benefitsetting;

  benefitsetting = _.extend(benefitsetting, req.body);

  benefitsetting.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(benefitsetting);
    }
  });
};

/**
 * Delete an Benefitsetting
 */
exports.delete = function(req, res) {
  var benefitsetting = req.benefitsetting;

  benefitsetting.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(benefitsetting);
    }
  });
};

/**
 * List of Benefitsettings
 */
exports.list = function(req, res) {
  Benefitsetting.find().sort('-created').populate('user', 'displayName').exec(function(err, benefitsettings) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(benefitsettings);
    }
  });
};

/**
 * Benefitsetting middleware
 */
exports.benefitsettingByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Benefitsetting is invalid'
    });
  }

  Benefitsetting.findById(id).populate('user', 'displayName').exec(function (err, benefitsetting) {
    if (err) {
      return next(err);
    } else if (!benefitsetting) {
      return res.status(404).send({
        message: 'No Benefitsetting with that identifier has been found'
      });
    }
    req.benefitsetting = benefitsetting;
    next();
  });
};
