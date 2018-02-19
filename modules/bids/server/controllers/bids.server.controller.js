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

// schedule
var schedule = require('node-schedule');
/**
 * Create a Bid
 */
exports.create = function (req, res, next) {
  var bid = new Bid(req.body);
  bid.user = req.user;

  bid.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.bid = bid;
      // res.jsonp(bid);
      next();
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
exports.update = function (req, res, next) {
  var bid = req.bid;

  bid = _.extend(bid, req.body);

  bid.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.bid = bid;
      // res.jsonp(bid);
      next();
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
      var today = new Date();

      bids.forEach(function (element) {

        var startdate = new Date(element.starttime);
        startdate = startdate.setHours(startdate.getHours() - 7);
        var expiredate = new Date(element.endtime);
        // expiredate = expiredate.setHours(expiredate.getHours() - 7);
        var endShow = expiredate.setHours(expiredate.getHours() - 7);
        var isbid = false;

        if (today >= startdate && today <= expiredate) {
          cookingData[0].items.push({
            _id: element._id,
            created: element.created,
            image: element.image ? element.image[0] : '',
            price: element.price ? element.price : element.startprice,
            isBid: true,
            pricestart: element.startprice,
            pricebid: element.bidprice,
            datestart: startdate,
            dateend: endShow,
            time: counttime(expiredate)
          });
          isbid = true;
        } else if (startdate >= today) {
          cookingData[1].items.push({
            _id: element._id,
            created: element.created,
            image: element.image ? element.image[0] : '',
            price: element.price ? element.price : element.startprice,
            isBid: false,
            pricestart: element.startprice,
            pricebid: element.bidprice,
            datestart: startdate,
            dateend: endShow
          });
        }
        if (req.user && element.userbid && element.userbid.length > 0) {
          if (element.userbid.map(function (e) {
              return e.user.toString();
            }).indexOf(req.user._id.toString()) !== -1) {
            // console.log(element.userbid.map(function (e) { return e.user.toString(); }).indexOf(req.user._id.toString()));
            var reverseUserBid = element.userbid.reverse();
            var selectedDate = reverseUserBid[reverseUserBid.map(function (e) {
              return e.user.toString();
            }).indexOf(req.user._id.toString())].created;
            var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            if (selectedDate >= lastWeek && selectedDate <= today) {
              cookingData[2].items.push({
                _id: element._id,
                created: element.created,
                image: element.image ? element.image[0] : '',
                price: element.price ? element.price : element.startprice,
                isBid: isbid,
                pricestart: element.startprice,
                pricebid: element.bidprice,
                datestart: new Date(element.starttime),
                dateend: endShow,
                time: counttime(selectedDate)
              });
              cookingData[2].items = cookingData[2].items.sort(function (a, b) {
                return (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0);
              });
            }

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
  startdate = startdate.setHours(startdate.getHours() - 7);
  var expiredate = new Date(bid.endtime);
  var endShow = expiredate.setHours(expiredate.getHours() - 7);
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
    datestart: startdate,
    dateend: endShow,
    datenow: new Date(),
    price: price > 0 ? price : bid.startprice,
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

exports.scheduleBid = function (req, res) {
  var date = new Date(req.bid.endtime);
  // var startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 0);
  var startTime = new Date(2018, 2, 19, 16, 5, 0);
  var j = schedule.scheduleJob(startTime, function () {
    console.log(req.bid);
    j.cancel();
  });

  res.jsonp(req.bid);
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
