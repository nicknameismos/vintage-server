'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Coupon = mongoose.model('Coupon'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  request = require('request'),
  pushNotiUrl = process.env.PUSH_NOTI_URL || 'https://onesignal.com/api/v1/notifications',
  pushNotification = mongoose.model('Notification');

/**
 * Create a Coupon
 */
exports.create = function (req, res, next) {
  var coupon = new Coupon(req.body);
  coupon.user = req.user;

  coupon.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      coupon.populate({
        path: 'owner',
        model: 'User'
      }, function (err, couponPop) {
        req.coupon = couponPop;
        next();
      });
    }
  });
};

/**
 * Show the current Coupon
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var coupon = req.coupon ? req.coupon.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  coupon.isCurrentUserOwner = req.user && coupon.user && coupon.user._id.toString() === req.user._id.toString();

  res.jsonp(coupon);
};

/**
 * Update a Coupon
 */
exports.update = function (req, res) {
  var coupon = req.coupon;

  coupon = _.extend(coupon, req.body);

  coupon.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coupon);
    }
  });
};

/**
 * Delete an Coupon
 */
exports.delete = function (req, res) {
  var coupon = req.coupon;

  coupon.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coupon);
    }
  });
};

/**
 * List of Coupons
 */
exports.list = function (req, res) {
  Coupon.find().sort('-created').populate('user', 'displayName').exec(function (err, coupons) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(coupons);
    }
  });
};

/**
 * Coupon middleware
 */
exports.couponByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Coupon is invalid'
    });
  }

  Coupon.findById(id).populate('user', 'displayName').exec(function (err, coupon) {
    if (err) {
      return next(err);
    } else if (!coupon) {
      return res.status(404).send({
        message: 'No Coupon with that identifier has been found'
      });
    }
    req.coupon = coupon;
    next();
  });
};

exports.getCouponCode = function (req, res, next) {
  req.message = '';
  req.status = true;
  req.discount = null;
  req.code = '';
  Coupon.find(req.body).populate('user', 'displayName').exec(function (err, coupon) {
    if (err) {
      return next(err);
    } else if (!coupon) {
      return res.status(404).send({
        message: 'No Coupon with that identifier has been found'
      });
    }
    if (coupon && coupon.length > 0) {
      req.coupon = coupon[0];
    } else {
      req.coupon = undefined;
    }
    next();
  });
};

exports.wrongCode = function (req, res, next) {
  if (req.coupon) {
    next();
  } else {
    req.message = 'Coupon is invalid!';
    req.status = false;
    next();
  }
};

exports.expiredCode = function (req, res, next) {
  if (!req.status) {
    next();
  } else {
    var startdate = new Date(req.coupon.startdate);
    startdate.setHours(0, 0, 0);
    var expiredate = new Date(req.coupon.enddate);
    expiredate.setHours(0, 0, 0);
    expiredate.setDate(expiredate.getDate() + 1);
    var today = new Date();

    if (today >= startdate && today < expiredate) {

      next();
    } else {
      req.message = 'Coupon is expired!';
      req.status = false;
      next();
    }
  }
};

exports.usedCode = function (req, res, next) {
  if (!req.status) {
    next();
  } else {
    if (req.coupon.type === 'single') {
      if (req.coupon.owner.indexOf(req.user._id) !== -1) {
        if (req.coupon.useruse.indexOf(req.user._id) !== -1) {
          req.message = 'Coupon is already!';
          req.status = false;
          next();
        } else {
          next();
        }

      } else {
        req.message = 'Coupon is invalid!';
        req.status = false;
        next();
      }

    } else {
      if (req.coupon.useruse.indexOf(req.user._id) !== -1) {
        req.message = 'Coupon is already!';
        req.status = false;
        next();
      } else {
        next();
      }
    }
  }
};

exports.resCouponCode = function (req, res) {
  if (req.status) {
    req.code = req.coupon.code;
    req.discount = req.coupon.price;
  }
  res.jsonp({
    code: req.code,
    discount: req.discount,
    status: req.status,
    message: req.message
  });
};

exports.notification = function (req, res) {
  var coupon = req.coupon;
  var notifications = [];
  var ids = [];
  if (coupon.type === 'single') {
    coupon.owner.forEach(function (user) {
      notifications.push({
        title: 'คูปองส่วนลดสำหรับคุณ',
        detail: coupon.message,
        userowner: user,
        user: user
      });
      ids = ids.concat(user.notificationids);
    });
    sendNotification('คูปองส่วนลดสำหรับคุณ', coupon.message, ids);
    pushNotification.create(notifications, function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.jsonp(coupon);
    });
  } else {
    User.find().sort('-created').exec(function (err, users) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        ids = 'All';
        users.forEach(function (user) {
          notifications.push({
            title: 'คูปองส่วนลดสำหรับคุณ',
            detail: coupon.message,
            userowner: user,
            user: user
          });
        });
        sendNotification('คูปองส่วนลดสำหรับคุณ', coupon.message, ids);
        pushNotification.create(notifications, function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.jsonp(coupon);
        });
      }
    });
  }

};

function sendNotification(title, message, ids) {
  var requestJsonOption = {};
  if (ids === 'All') {
    requestJsonOption = {
      app_id: 'd5d9533c-3ac8-42e6-bc16-a5984bef02ff',
      headings: {
        en: title
      },
      contents: {
        en: message
      },
      included_segments: "All"
    };
  } else {
    requestJsonOption = {
      app_id: 'd5d9533c-3ac8-42e6-bc16-a5984bef02ff',
      headings: {
        en: title
      },
      contents: {
        en: message
      },
      include_player_ids: ids
    };
  }
  request({
    url: pushNotiUrl,
    headers: {
      'Authorization': 'Basic ZWNkZWY0MmUtNGJiNC00ZThjLWIyOWUtNzdmNzAxZmMyZDMw'
    },
    method: 'POST',
    json: requestJsonOption
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error);

    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    // console.log(response);
  });
}
