'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Bid = mongoose.model('Bid'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Bid
 */
exports.create = function (req, res) {
  var bid = new Bid(req.body);
  bid.user = req.user;

  bid.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(bid);
    }
  });
};

/**
 * Show the current Bid
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var bid = req.bid ? req.bid.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  bid.isCurrentUserOwner = req.user && bid.user && bid.user._id.toString() === req.user._id.toString();

  res.jsonp(bid);
};

/**
 * Update a Bid
 */
exports.update = function (req, res) {
  var bid = req.bid;

  bid = _.extend(bid, req.body);

  bid.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(bid);
    }
  });
};

/**
 * Delete an Bid
 */
exports.delete = function (req, res) {
  var bid = req.bid;

  bid.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(bid);
    }
  });
};

/**
 * List of Bids
 */
exports.list = function (req, res) {
  Bid.find().sort('-created').populate('user', 'displayName').exec(function (err, bids) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(bids);
    }
  });
};

/**
 * Bid middleware
 */
exports.bidByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Bid is invalid'
    });
  }

  Bid.findById(id).populate('user', 'displayName').exec(function (err, bid) {
    if (err) {
      return next(err);
    } else if (!bid) {
      return res.status(404).send({
        message: 'No Bid with that identifier has been found'
      });
    }
    req.bid = bid;
    next();
  });
};

exports.cookingBid = function (req, res, next) {
  var items = [];
  Bid.find().sort('-created').populate('user', 'displayName').exec(function (err, bids) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      bids.forEach(function (element) {
        items.push({
          image: element.image[0],
          price: element.price,
          isBid: true,
          pricestart: element.startprice,
          pricebid: element.bidprice,
          datestart: element.starttime,
          dateend: element.endtime
        });
      });
      req.bids = items;
      next();
    }
  });
};

exports.resBids = function (req, res) {
  res.jsonp({
    items: req.bids
  });
};
