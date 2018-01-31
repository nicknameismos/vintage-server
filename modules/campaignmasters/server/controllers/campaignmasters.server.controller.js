'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Campaignmaster = mongoose.model('Campaignmaster'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Campaignmaster
 */
exports.create = function(req, res) {
  var campaignmaster = new Campaignmaster(req.body);
  campaignmaster.user = req.user;

  campaignmaster.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaignmaster);
    }
  });
};

/**
 * Show the current Campaignmaster
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var campaignmaster = req.campaignmaster ? req.campaignmaster.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  campaignmaster.isCurrentUserOwner = req.user && campaignmaster.user && campaignmaster.user._id.toString() === req.user._id.toString();

  res.jsonp(campaignmaster);
};

/**
 * Update a Campaignmaster
 */
exports.update = function(req, res) {
  var campaignmaster = req.campaignmaster;

  campaignmaster = _.extend(campaignmaster, req.body);

  campaignmaster.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaignmaster);
    }
  });
};

/**
 * Delete an Campaignmaster
 */
exports.delete = function(req, res) {
  var campaignmaster = req.campaignmaster;

  campaignmaster.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaignmaster);
    }
  });
};

/**
 * List of Campaignmasters
 */
exports.list = function(req, res) {
  Campaignmaster.find().sort('-created').populate('user', 'displayName').exec(function(err, campaignmasters) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(campaignmasters);
    }
  });
};

/**
 * Campaignmaster middleware
 */
exports.campaignmasterByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Campaignmaster is invalid'
    });
  }

  Campaignmaster.findById(id).populate('user', 'displayName').exec(function (err, campaignmaster) {
    if (err) {
      return next(err);
    } else if (!campaignmaster) {
      return res.status(404).send({
        message: 'No Campaignmaster with that identifier has been found'
      });
    }
    req.campaignmaster = campaignmaster;
    next();
  });
};
