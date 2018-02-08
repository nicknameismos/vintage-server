'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Order = mongoose.model('Order'),
  Product = mongoose.model('Product'),
  User = mongoose.model('User'),
  Shop = mongoose.model('Shop'),
  Coupon = mongoose.model('Coupon'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  omise = require('omise')({
    'publicKey': 'pkey_test_5asc1ucstk1imcxnhy7',
    'secretKey': 'skey_test_5asc1uct2yat7bftf3j'
  });
/**
 * Create a Order
 */

exports.updateCoupon = function (req, res, next) {
  var order = req.body;
  if (order.coupon && order.coupon.code) {
    Coupon.find({ code: order.coupon.code }).exec(function (err, coupons) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        if (coupons && coupons.length > 0) {
          Coupon.findById(coupons[0]._id).exec(function (err, coupon) {
            if (err) {
              return next(err);
            } else if (!coupon) {
              return res.status(404).send({
                message: 'No Coupon with that identifier has been found'
              });
            }
            coupon.useruse.push(req.user);
            coupon.save(function (err) {
              if (err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                next();
              }
            });
          });
        } else {
          next();
        }

      }
    });
  } else {
    next();
  }
};

exports.omiseCard = function (req, res, next) {
  var order = req.body;
  if (order.payment && order.payment.paymenttype === 'Credit Card') {
    var money = order.totalamount * 100;
    var id = order.omiseToken;
    omise.charges.create({
      'description': 'Charge for order ID:' + order._id,
      'amount': money,
      'currency': 'thb',
      'capture': true,
      'card': id
    }, function (err, resp) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.omiseresponse = resp;
        next();
      }
    });
  } else {
    next();
  }

};

exports.create = function (req, res) {
  var order = new Order(req.body);
  order.omiseresponse = req.omiseresponse;
  order.user = req.user;

  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(order);
    }
  });
};

/**
 * Show the current Order
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var order = req.order ? req.order.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  order.isCurrentUserOwner = req.user && order.user && order.user._id.toString() === req.user._id.toString();

  res.jsonp(order);
};

/**
 * Update a Order
 */
exports.update = function (req, res) {
  var order = req.order;

  order = _.extend(order, req.body);
  order.omiseresponse = req.omiseresponse;
  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(order);
    }
  });
};

/**
 * Delete an Order
 */
exports.delete = function (req, res) {
  var order = req.order;

  order.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(order);
    }
  });
};

/**
 * List of Orders
 */
exports.list = function (req, res) {
  Order.find().sort('-created').populate('user', 'displayName').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(orders);
    }
  });
};

/**
 * Order middleware
 */
exports.orderByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Order is invalid'
    });
  }

  Order.findById(id).populate('user', 'displayName').exec(function (err, order) {
    if (err) {
      return next(err);
    } else if (!order) {
      return res.status(404).send({
        message: 'No Order with that identifier has been found'
      });
    }
    req.order = order;
    next();
  });
};
