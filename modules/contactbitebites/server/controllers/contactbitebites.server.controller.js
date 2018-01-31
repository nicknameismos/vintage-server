'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Contactbitebite = mongoose.model('Contactbitebite'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Contactbitebite
 */
exports.create = function(req, res) {
  var contactbitebite = new Contactbitebite(req.body);
  contactbitebite.user = req.user;

  contactbitebite.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(contactbitebite);
    }
  });
};

/**
 * Show the current Contactbitebite
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var contactbitebite = req.contactbitebite ? req.contactbitebite.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  contactbitebite.isCurrentUserOwner = req.user && contactbitebite.user && contactbitebite.user._id.toString() === req.user._id.toString();

  res.jsonp(contactbitebite);
};

/**
 * Update a Contactbitebite
 */
exports.update = function(req, res) {
  var contactbitebite = req.contactbitebite;

  contactbitebite = _.extend(contactbitebite, req.body);

  contactbitebite.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(contactbitebite);
    }
  });
};

/**
 * Delete an Contactbitebite
 */
exports.delete = function(req, res) {
  var contactbitebite = req.contactbitebite;

  contactbitebite.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(contactbitebite);
    }
  });
};

/**
 * List of Contactbitebites
 */
exports.list = function(req, res) {
  Contactbitebite.find().sort('-created').populate('user', 'displayName').populate('title','name').exec(function(err, contactbitebites) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(contactbitebites);
    }
  });
};

/**
 * Contactbitebite middleware
 */
exports.contactbitebiteByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Contactbitebite is invalid'
    });
  }

  Contactbitebite.findById(id).populate('user', 'displayName').populate('title','name').exec(function (err, contactbitebite) {
    if (err) {
      return next(err);
    } else if (!contactbitebite) {
      return res.status(404).send({
        message: 'No Contactbitebite with that identifier has been found'
      });
    }
    req.contactbitebite = contactbitebite;
    next();
  });
};
