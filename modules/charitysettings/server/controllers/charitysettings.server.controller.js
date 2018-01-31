'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Charitysetting = mongoose.model('Charitysetting'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Charitysetting
 */
exports.create = function(req, res) {
  var charitysetting = new Charitysetting(req.body);
  charitysetting.user = req.user;

  charitysetting.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(charitysetting);
    }
  });
};

/**
 * Show the current Charitysetting
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var charitysetting = req.charitysetting ? req.charitysetting.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  charitysetting.isCurrentUserOwner = req.user && charitysetting.user && charitysetting.user._id.toString() === req.user._id.toString();

  res.jsonp(charitysetting);
};

/**
 * Update a Charitysetting
 */
exports.update = function(req, res) {
  var charitysetting = req.charitysetting;

  charitysetting = _.extend(charitysetting, req.body);

  charitysetting.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(charitysetting);
    }
  });
};

/**
 * Delete an Charitysetting
 */
exports.delete = function(req, res) {
  var charitysetting = req.charitysetting;

  charitysetting.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(charitysetting);
    }
  });
};

/**
 * List of Charitysettings
 */
exports.list = function(req, res) {
  Charitysetting.find().sort('-created').populate('user', 'displayName').exec(function(err, charitysettings) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(charitysettings);
    }
  });
};

/**
 * Charitysetting middleware
 */
exports.charitysettingByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Charitysetting is invalid'
    });
  }

  Charitysetting.findById(id).populate('user', 'displayName').exec(function (err, charitysetting) {
    if (err) {
      return next(err);
    } else if (!charitysetting) {
      return res.status(404).send({
        message: 'No Charitysetting with that identifier has been found'
      });
    }
    req.charitysetting = charitysetting;
    next();
  });
};
