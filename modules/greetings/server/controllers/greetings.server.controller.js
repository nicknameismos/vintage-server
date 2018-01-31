'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Greeting = mongoose.model('Greeting'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Greeting
 */
exports.create = function(req, res) {
  var greeting = new Greeting(req.body);
  greeting.user = req.user;

  greeting.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(greeting);
    }
  });
};

/**
 * Show the current Greeting
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var greeting = req.greeting ? req.greeting.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  greeting.isCurrentUserOwner = req.user && greeting.user && greeting.user._id.toString() === req.user._id.toString();

  res.jsonp(greeting);
};

/**
 * Update a Greeting
 */
exports.update = function(req, res) {
  var greeting = req.greeting;

  greeting = _.extend(greeting, req.body);

  greeting.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(greeting);
    }
  });
};

/**
 * Delete an Greeting
 */
exports.delete = function(req, res) {
  var greeting = req.greeting;

  greeting.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(greeting);
    }
  });
};

/**
 * List of Greetings
 */
exports.list = function(req, res) {
  Greeting.find().sort('-created').populate('user', 'displayName').exec(function(err, greetings) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(greetings);
    }
  });
};

/**
 * Greeting middleware
 */
exports.greetingByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Greeting is invalid'
    });
  }

  Greeting.findById(id).populate('user', 'displayName').exec(function (err, greeting) {
    if (err) {
      return next(err);
    } else if (!greeting) {
      return res.status(404).send({
        message: 'No Greeting with that identifier has been found'
      });
    }
    req.greeting = greeting;
    next();
  });
};
