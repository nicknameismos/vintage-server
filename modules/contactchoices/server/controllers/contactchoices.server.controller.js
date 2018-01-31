'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Contactchoice = mongoose.model('Contactchoice'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Contactchoice
 */
exports.create = function(req, res) {
  var contactchoice = new Contactchoice(req.body);
  contactchoice.user = req.user;

  contactchoice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(contactchoice);
    }
  });
};

/**
 * Show the current Contactchoice
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var contactchoice = req.contactchoice ? req.contactchoice.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  contactchoice.isCurrentUserOwner = req.user && contactchoice.user && contactchoice.user._id.toString() === req.user._id.toString();

  res.jsonp(contactchoice);
};

/**
 * Update a Contactchoice
 */
exports.update = function(req, res) {
  var contactchoice = req.contactchoice;

  contactchoice = _.extend(contactchoice, req.body);

  contactchoice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(contactchoice);
    }
  });
};

/**
 * Delete an Contactchoice
 */
exports.delete = function(req, res) {
  var contactchoice = req.contactchoice;

  contactchoice.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(contactchoice);
    }
  });
};

/**
 * List of Contactchoices
 */
exports.list = function(req, res) {
  Contactchoice.find().sort('created').populate('user', 'displayName').exec(function(err, contactchoices) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(contactchoices);
    }
  });
};

/**
 * Contactchoice middleware
 */
exports.contactchoiceByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Contactchoice is invalid'
    });
  }

  Contactchoice.findById(id).populate('user', 'displayName').exec(function (err, contactchoice) {
    if (err) {
      return next(err);
    } else if (!contactchoice) {
      return res.status(404).send({
        message: 'No Contactchoice with that identifier has been found'
      });
    }
    req.contactchoice = contactchoice;
    next();
  });
};
