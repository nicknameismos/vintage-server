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
