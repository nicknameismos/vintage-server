'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  pushNotification = mongoose.model('Notification'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a pushNotification
 */
exports.create = function (req, res) {
  var notification = new pushNotification(req.body);
  notification.user = req.user;

  notification.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(notification);
    }
  });
};

/**
 * Show the current pushNotification
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var notification = req.notification ? req.notification.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  notification.isCurrentUserOwner = req.user && notification.user && notification.user._id.toString() === req.user._id.toString();

  res.jsonp(notification);
};

/**
 * Update a pushNotification
 */
exports.update = function (req, res) {
  var notification = req.notification;

  notification = _.extend(notification, req.body);

  notification.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(notification);
    }
  });
};

/**
 * Delete an pushNotification
 */
exports.delete = function (req, res) {
  var notification = req.notification;

  notification.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(notification);
    }
  });
};

/**
 * List of pushNotifications
 */
exports.list = function (req, res) {
  pushNotification.find().sort('-created').populate('user', 'displayName').exec(function (err, notifications) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(notifications);
    }
  });
};

/**
 * pushNotification middleware
 */
exports.notificationByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'pushNotification is invalid'
    });
  }

  pushNotification.findById(id).populate('user', 'displayName').exec(function (err, notification) {
    if (err) {
      return next(err);
    } else if (!notification) {
      return res.status(404).send({
        message: 'No pushNotification with that identifier has been found'
      });
    }
    req.notification = notification;
    next();
  });
};

exports.listOwner = function (req, res) {
  pushNotification.find({ userowner: req.user._id }).sort('-created').populate('user', 'displayName').exec(function (err, notifications) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(notifications);
    }
  });
};

exports.readOwner = function (req, res) {
  var noti = req.notification;
  noti.isread = true;
  noti.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.jsonp(noti);
  });
};

exports.badge = function (req, res) {
  pushNotification.find({ userowner: req.user._id, isread: false }).sort('-created').populate('user', 'displayName').exec(function (err, notifications) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(notifications.length);
    }
  });
};