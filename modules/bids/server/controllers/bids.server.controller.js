'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Bid = mongoose.model('Bid'),
  User = mongoose.model('User'),
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

  Bid.findById(id).populate('user', 'displayName profileImageURL').populate('userbid.user', 'displayName profileImageURL').exec(function (err, bid) {
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

exports.userBidId = function (req, res, next, userbidid) {
  if (userbidid !== 'nouser') {
    User.findById(userbidid).exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return res.status(404).send({
          message: 'No User with that identifier has been found'
        });
      }
      req.user = user;
      next();
    });
  } else {
    next();
  }

};

exports.cookingBid = function (req, res, next) {
  // var items = [];
  Bid.find().sort('-created').populate('user', 'displayName').exec(function (err, bids) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var cookingData = [{
        type: 'NOW',
        items: []
      }, {
        type: 'COMING_SOON',
        items: []
      }, {
        type: 'ME',
        items: []
      }];

      bids.forEach(function (element) {

        var startdate = new Date(element.starttime);
        var expiredate = new Date(element.endtime);
        var today = new Date();

        if (today >= startdate && today <= expiredate) {
          cookingData[0].items.push({
            _id: element._id,
            created: element.created,
            image: element.image ? element.image[0] : '',
            price: element.price,
            isBid: true,
            pricestart: element.startprice,
            pricebid: element.bidprice,
            datestart: element.starttime,
            dateend: element.endtime,
            time: counttime(expiredate)
          });
        } else if (startdate >= today) {
          cookingData[1].items.push({
            _id: element._id,
            created: element.created,
            image: element.image ? element.image[0] : '',
            price: element.price,
            isBid: false,
            pricestart: element.startprice,
            pricebid: element.bidprice,
            datestart: element.starttime,
            dateend: element.endtime
          });
        }
        if (req.user) {
          if (element.userbid.map(function (e) { return e.user.toString(); }).indexOf(req.user._id.toString()) !== -1) {
            // console.log(element.userbid.map(function (e) { return e.user.toString(); }).indexOf(req.user._id.toString()));
            cookingData[2].items.push({
              _id: element._id,
              created: element.created,
              image: element.image ? element.image[0] : '',
              price: element.price,
              isBid: false,
              pricestart: element.startprice,
              pricebid: element.bidprice,
              datestart: element.starttime,
              dateend: element.endtime
            });
          }
        }

      });
      // orderRes4.items[orderRes4.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())]
      cookingData[0].items = cookingData[0].items.sort(function (a, b) {
        return (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0);
      });
      req.bids = cookingData;
      next();
    }
  });
};

exports.resBids = function (req, res) {
  res.jsonp({
    datenow: new Date(),
    items: req.bids
  });
};

exports.getBidDetail = function (req, res) {
  var bid = req.bid ? req.bid.toJSON() : {};
  var isBid = false;
  var startdate = new Date(bid.starttime);
  var expiredate = new Date(bid.endtime);
  var today = new Date();
  var price = 0;
  var userid = '';
  var displayName = '';
  var image = '';
  if (today >= startdate && today <= expiredate) {
    isBid = true;
  }
  if (bid && bid.userbid && bid.userbid.length > 0) {
    price = bid.userbid[bid.userbid.length - 1].bidprice || 0;
    userid = bid.userbid[bid.userbid.length - 1].user._id;
    displayName = bid.userbid[bid.userbid.length - 1].user.displayName;
    image = bid.userbid[bid.userbid.length - 1].user.profileImageURL;
  }
  var resbid = {
    _id: bid._id,
    product: {
      name: bid.name,
      images: bid.image,
      detail: bid.detail
    },
    datestart: bid.starttime,
    dateend: bid.endtime,
    datenow: new Date(),
    price: price,
    pricestart: bid.startprice,
    pricebid: bid.bidprice,
    isBid: isBid,
    currentuser: {
      _id: userid,
      name: displayName,
      profileImageURL: image
    }
  };
  res.jsonp(resbid);
};

function counttime(expire) {
  var time = 0;
  var today = new Date();
  var expireDay = new Date(expire);
  var t = expireDay - today;
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));

  if (days > 0) {
    time += (days * 24) * 60;
  }

  if (hours > 0) {
    time += hours * 60;
  }

  if (minutes > 0) {
    time += minutes;
  }

  return time;
}
