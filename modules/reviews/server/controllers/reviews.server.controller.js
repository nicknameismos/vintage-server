'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Review = mongoose.model('Review'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Review
 */
exports.create = function (req, res) {
  var review = new Review(req.body);
  review.user = req.user;

  review.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(review);
    }
  });
};

/**
 * Show the current Review
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var review = req.review ? req.review.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  review.isCurrentUserOwner = req.user && review.user && review.user._id.toString() === req.user._id.toString();

  res.jsonp(review);
};

/**
 * Update a Review
 */
exports.update = function (req, res) {
  var review = req.review;

  review = _.extend(review, req.body);

  review.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(review);
    }
  });
};

/**
 * Delete an Review
 */
exports.delete = function (req, res) {
  var review = req.review;

  review.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(review);
    }
  });
};

/**
 * List of Reviews
 */
exports.list = function (req, res) {
  Review.find().sort('-created').populate('user', 'displayName').exec(function (err, reviews) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reviews);
    }
  });
};

/**
 * Review middleware
 */
exports.reviewByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Review is invalid'
    });
  }

  Review.findById(id).populate('user', 'displayName profileImageURL').exec(function (err, review) {
    if (err) {
      return next(err);
    } else if (!review) {
      return res.status(404).send({
        message: 'No Review with that identifier has been found'
      });
    }
    req.review = review;
    next();
  });
};

exports.updateIslikes = function (req, res) {
  var islike = false;
  if (req.review.likes.indexOf(req.user._id) > -1) {
    req.review.likes.splice(req.review.likes.indexOf(req.user._id), 1);
  } else {
    req.review.likes.push(req.user);
    islike = true;
  }
  req.review.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var data = {
        _id: req.review._id,
        title: req.review.title,
        description: req.review.description,
        image: req.review.image,
        countlike: req.review.likes.length,
        islike: islike,
        user: req.review.user
      };
      res.jsonp(data);
    }
  });
};

exports.getListReview = function (req, res, next) {
  Review.find({
    active: true
  }).sort('-created').populate('user', 'displayName profileImageURL').exec(function (err, reviews) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.reviews = reviews;
      next();
    }
  });
};

exports.cookingListReview = function (req, res, next) {
  var cookingreviews = [];
  var reviews = req.reviews;
  reviews.forEach(function (review) {
    if (review.likes.indexOf(req.user._id) > -1) {
      // have
      cookingreviews.push({
        _id: review._id,
        title: review.title,
        description: review.description,
        image: review.image,
        countlike: review.likes.length,
        islike: true,
        user: review.user,
        created: review.created
      });
    } else {
      // not have
      cookingreviews.push({
        _id: review._id,
        title: review.title,
        description: review.description,
        image: review.image,
        countlike: review.likes.length,
        islike: false,
        user: review.user,
        created: review.created
      });
    }
  });

  req.cookingreviews = cookingreviews;
  next();

};

exports.listReview = function (req, res) {
  res.jsonp(req.cookingreviews);
};
