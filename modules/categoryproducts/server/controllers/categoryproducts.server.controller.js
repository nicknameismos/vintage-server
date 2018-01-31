'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Categoryproduct = mongoose.model('Categoryproduct'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Categoryproduct
 */
exports.create = function (req, res) {
  var categoryproduct = new Categoryproduct(req.body);
  categoryproduct.user = req.user;

  categoryproduct.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(categoryproduct);
    }
  });
};

/**
 * Show the current Categoryproduct
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var categoryproduct = req.categoryproduct ? req.categoryproduct.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  categoryproduct.isCurrentUserOwner = req.user && categoryproduct.user && categoryproduct.user._id.toString() === req.user._id.toString();
  // console.log('read -  -------' + JSON.stringify(categoryproduct));
  res.jsonp(categoryproduct);
};

/**
 * Update a Categoryproduct
 */
exports.update = function (req, res) {
  var categoryproduct = req.categoryproduct;

  // categoryproduct = _.extend(categoryproduct, req.body);
  categoryproduct.name = req.body.name;
  categoryproduct.image = req.body.image;
  categoryproduct.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(categoryproduct);
    }
  });
};

/**
 * Delete an Categoryproduct
 */
exports.delete = function (req, res) {
  var categoryproduct = req.categoryproduct;

  categoryproduct.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(categoryproduct);
    }
  });
};

/**
 * List of Categoryproducts
 */
exports.list = function (req, res) {
  Categoryproduct.find().sort('-created').populate('user', 'displayName').populate('shop').exec(function (err, categoryproducts) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(categoryproducts);
    }
  });
};

/**
 * Categoryproduct middleware
 */
exports.categoryproductByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Categoryproduct is invalid'
    });
  }

  Categoryproduct.findById(id).populate('user', 'displayName').populate('shop').exec(function (err, categoryproduct) {
    if (err) {
      return next(err);
    } else if (!categoryproduct) {
      return res.status(404).send({
        message: 'No Categoryproduct with that identifier has been found'
      });
    }
    req.categoryproduct = categoryproduct;
    next();
  });
};

exports.shopID = function (req, res, next, shopid) {
  Categoryproduct.find({
    shop: shopid
  }, '_id name image price priority').sort('-created').populate('user', 'displayName').exec(function (err, categoryproducts) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.categoryproducts = categoryproducts;
      next();
    }
  });
};

exports.cookingCategoryProductList = function (req, res, next) {
  var categoryproducts = [];
  // console.log(req.products);
  req.categoryproducts.forEach(function (element) {
    // var categories = [];
    // element.categories.forEach(function (cate) {
    //   categories.push({
    //     name: cate.name
    //   });
    // });
    categoryproducts.push({
      _id: element._id,
      name: element.name,
      image: element.image,
      priority: element.priority
    });
  });
  req.categoriesCookingList = categoryproducts;
  next();
};

exports.categoryProductByShop = function (req, res) {
  // console.log('data' + JSON.stringify(req.productsCookingList));
  res.jsonp({
    items: req.categoriesCookingList ? req.categoriesCookingList : []
  });
};
