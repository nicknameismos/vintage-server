'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Ad = mongoose.model('Ad'),
  Categoryshop = mongoose.model('Categoryshop'),
  Shop = mongoose.model('Shop'),
  Hotprice = mongoose.model('Hotprice'),
  Benefitsetting = mongoose.model('Benefitsetting'),
  Bid = mongoose.model('Bid'),
  Product = mongoose.model('Product'),
  Coinbalance = mongoose.model('Coinbalance'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');



exports.getlat = function (req, res, next, lat, lng) {
  next();
};
exports.getlng = function (req, res, next, lat, lng) {
  next();
};

exports.getcateid = function (req, res, next, cateid) {
  req.cateid = cateid;
  next();
};

exports.getcondition = function (req, res, next, condition) {
  req.condition = condition;
  next();
};


exports.getshopbycate = function (req, res) {
  Shop.find({
    categories: mongoose.Types.ObjectId(req.cateid)
  }).sort().exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(shops);
    }
  });

};

exports.ads = function (req, res, next) {
  req.ads = {
    "title": "Advertise",
    "items": []
  };
  Ad.find({
    status: true
  }).sort('-created').limit(5).exec(function (err, ads) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      ads.forEach(function (ad) {
        req.ads.items.push(ad);
      });
      next();
    }
  });

};

exports.hotprices = function (req, res, next) {
  req.hotprices = {
    title: "Hot Price",
    items1: [],
    items2: []
  };
  next();
};

exports.hotpricesItm1 = function (req, res, next) {
  Hotprice.find({}, '_id image shop', {
    skip: 0,
    limit: 6
  }).sort('-created').exec(function (err, hotprices) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      hotprices.forEach(function (hotprice) {
        req.hotprices.items1.push(hotprice);
      });
      next();
    }
  });
};

exports.hotpricesItm2 = function (req, res, next) {
  Hotprice.find({}, '_id image shop', {
    skip: 6,
    limit: 6
  }).sort('-created').exec(function (err, hotprices) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      hotprices.forEach(function (hotprice) {
        req.hotprices.items2.push(hotprice);
      });
      next();
    }
  });
};

exports.categories = function (req, res, next) {
  req.categories = {
    "title": "Category",
    "items": []
  };
  Categoryshop.find({}, '_id image imageen').sort('seq').exec(function (err, categories) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      categories.forEach(function (category) {
        var resCate = {
          _id: category._id,
          image: category.image,
          imageen: category.imageen

        };
        req.categories.items.push(category);
      });
      next();
    }
  });
};

exports.listShop = function (req, res, next) {
  req.listShop = [{
    "title": "NEAR_BY",
    "items": []
  },
  {
    "title": "POPULAR",
    "items": []
  },
  {
    "title": "FAVORITE",
    "items": []
  }
  ];
  next();
};

exports.nearbyshops = function (req, res, next) {
  var items = [];
  var limit = {
    limit: 4
  };
  if (req.condition || req.cateid) {
    limit = {
      limit: 100
    };
  }
  var filter = {
    isactiveshop: true
  };
  if (req.cateid) {
    filter = {
      isactiveshop: true,
      categories: mongoose.Types.ObjectId(req.cateid)
    };
  }
  Shop.find(filter, '_id name rating coverimage isAds address', limit).sort('-created').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      shops.forEach(function (shop) {
        var resShop = {
          _id: shop._id,
          name: shop.name,
          rating: shop.rating,
          distance: 1.5,
          image: shop.coverimage,
          isAds: shop.isAds,
          lat: shop.address.lat,
          lng: shop.address.lng
        };
        items.push(resShop);
      });
      if (req.condition) {
        if (req.condition === 'NEAR_BY') {
          res.json(items);
        } else {
          next();
        }
      } else {
        req.listShop[0].items = items;
        next();
      }

    }
  });
};

exports.popshops = function (req, res, next) {

  var items = [];
  var limit = {
    limit: 4
  };
  if (req.condition) {
    limit = {
      limit: 100
    };
  }
  var filter = {
    isactiveshop: true
  };
  if (req.cateid) {
    filter = {
      isactiveshop: true,
      categories: mongoose.Types.ObjectId(req.cateid)
    };
  }
  Shop.find(filter, '_id name rating coverimage isAds address', limit).sort('-created').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      shops.forEach(function (shop) {
        var resShop = {
          _id: shop._id,
          name: shop.name,
          rating: shop.rating,
          distance: 1.5,
          image: shop.coverimage,
          isAds: shop.isAds,
          lat: shop.address.lat,
          lng: shop.address.lng
        };
        items.push(resShop);
      });
      if (req.condition) {
        if (req.condition === 'POPULAR') {
          res.json(items);
        } else {
          next();
        }
      } else {
        req.listShop[1].items = items;
        next();
      }
    }
  });
};

exports.favoriteshops = function (req, res, next) {
  var items = [];
  var limit = {
    limit: 4
  };
  if (req.condition) {
    limit = {
      limit: 100
    };
  }
  var filter = {
    isactiveshop: true
  };
  if (req.cateid) {
    filter = {
      isactiveshop: true,
      categories: mongoose.Types.ObjectId(req.cateid)
    };
  }
  Shop.find(filter, '_id name rating coverimage isAds address', limit).sort('-created').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      shops.forEach(function (shop) {
        var resShop = {
          _id: shop._id,
          name: shop.name,
          rating: shop.rating,
          distance: 1.5,
          image: shop.coverimage,
          isAds: shop.isAds,
          lat: shop.address.lat,
          lng: shop.address.lng
        };
        items.push(resShop);
      });
      if (req.condition) {
        if (req.condition === 'FAVORITE') {
          res.json(items);
        } else {
          next();
        }
      } else {
        req.listShop[2].items = items;
        next();
      }
    }
  });
};

exports.returnShop = function (req, res) {
  res.jsonp({
    ads: req.ads,
    hotprices: req.hotprices,
    categories: req.categories,
    shops: req.listShop
  });
};

exports.returnShopByCate = function (req, res) {
  req.listShop.splice(2, 1);
  res.jsonp(req.listShop);
};

exports.gettodaybyuser = function (req, res, next) {
  var now = new Date();
  var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  Coinbalance.find({
    user: req.user,
    created: {
      $gte: startOfToday
    }
  }).exec(function (err, todays) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (todays.length > 0) {
        res.json('today welcome already');
      } else {
        next();
      }
    }
  });
};

exports.getbenefitlogin = function (req, res, next) {
  Benefitsetting.findOne({
    name: 'login'
  }).sort('-created').exec(function (err, benefit) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.benefit = benefit;
      next();
    }
  });
};

exports.todaywelcome = function (req, res) {
  var benefit = req.benefit;
  var coinbalance = new Coinbalance({
    name: benefit.name,
    balancetype: 'in',
    volume: benefit.items[0].volume,
    refbenefit: benefit,
    user: req.user
  });
  coinbalance.save(function (errsave) {
    if (errsave) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(errsave)
      });
    } else {
      res.jsonp(req.benefit);
    }
  });

};

exports.getListBids = function (req, res, next) {
  Bid.find().sort('-starttime').exec(function (err, bids) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.bids = bids;
      next();
    }
  });
};

exports.cookingListBids = function (req, res, next) {
  var cookingBidsTrue = [];
  var cookingBidsFalse = [];
  req.bids.forEach(function (bid) {
    var startdate = new Date(bid.starttime);
    startdate = startdate.setHours(startdate.getHours() - 7);
    var expiredate = new Date(bid.endtime);
    expiredate = expiredate.setHours(expiredate.getHours() - 7);
    var today = new Date();
    // timeStart = today

    if (today >= startdate && today <= expiredate) {
      cookingBidsTrue.push({
        _id: bid._id,
        image: bid.image && bid.image[0] ? bid.image[0] : '',
        isBid: true,
        time: counttime(expiredate),
        created: bid.created
      });
    } else if (startdate >= today) {
      cookingBidsFalse.push({
        _id: bid._id,
        image: bid.image && bid.image[0] ? bid.image[0] : '',
        isBid: false,
        created: bid.created
      });
    }
  });
  var sortTime = cookingBidsTrue.sort(function (a, b) { return (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0); });
  req.resBids = sortTime.concat(cookingBidsFalse);
  next();
};

exports.getListAds = function (req, res, next) {
  Ad.find({ status: true }).sort('-created').exec(function (err, ads) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.ads = ads;
      next();
    }
  });
};

exports.cookingListAds = function (req, res, next) {
  var items = [];
  req.ads.forEach(function (ad) {
    items.push({
      _id: ad._id,
      image: ad.image,
      imagecount: 1,
      isvideo: ad.isvideo ? ad.isvideo : false,
      type: 'ads',
      created: ad.created
    });
  });
  req.items = items;
  next();
};

exports.getListProducts = function (req, res, next) {
  Product.find({ issale: true }).populate('shop').sort('-created').limit(54).exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var productsFilter = products.filter(function (obj) { return obj.shop && obj.shop.islaunch === true; });
      req.products = productsFilter;
      next();
    }
  });
};

exports.cookingListProducts = function (req, res, next) {
  // {_id:image}
  req.products.forEach(function (prod) {
    req.items.push({
      _id: prod._id,
      image: prod.images && prod.images.length > 0 ? prod.images[0] : '',
      imagecount: prod.images && prod.images.length > 0 ? prod.images.length : 1,
      isvideo: false,
      type: 'product',
      created: prod.created
    });
  });
  next();
};

exports.customerVintageHome = function (req, res, next) {
  var items = req.items.sort(function(a, b) { return (a.created < b.created) ? 1 : ((b.created < a.created) ? -1 : 0); });
  res.jsonp({
    bid: req.resBids,
    items: items
  });
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