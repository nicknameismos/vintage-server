'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shop = mongoose.model('Shop'),
  User = mongoose.model('User'),
  Categoryproduct = mongoose.model('Categoryproduct'),
  Product = mongoose.model('Product'),
  nodemailer = require('nodemailer'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');



exports.mailer = function (req, res) {
  // console.log('mail' + req.shop);
  // var data = req.shop.user;
  // var smtpTransport = nodemailer.createTransport("SMTP", {
  //   service: "Gmail",
  //   auth: {
  //     user: "mynameissarawut@gmail.com",
  //     pass: "097154642"
  //   }
  // });

  // var mailOptions = {
  //   from: "EatsyD ✔ <mynameissarawut@gmail.com>", // sender address✔
  //   // to: data.email, // list of receivers
  //   to: 'mynameissarawut@gmail.com',
  //   subject: "Username & password for shop", // Subject line
  //   html: "<p><b>" + "username" + " : " + data.username + "</b></p>" + "   " + "<p><b>" + "password" + " : " + "user1234" + "</b></p>", // plaintext body

  // };
  // smtpTransport.sendMail(mailOptions, function (error, response) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log("Message sent: " + response.message);
  //     res.jsonp(req.shop);
  //   }

  // });

  // console.log('mail' + req.shop);
  var data = req.shop.user;
  var email = req.shop.email;
  var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
      user: "cnetmiod@gmail.com",
      pass: "P@ssw0rd4321"
    }
    // auth: {
    //   user: "mailsentuser@gmail.com",
    //   pass: "P@ssw0rd12345"
    // }
  });
  console.log(email);
  var mailOptions = {
    from: "Green vintage ✔ <cnetmiod@gmail.com>", // sender address✔
    to: email, // list of receivers
    // to: 'mynameissarawut@gmail.com',
    subject: "Username & password for shop", // Subject line
    html: "<p><b>" + "username" + " : " + data.username + "</b></p>" + "   " + "<p><b>" + "password" + " : " + "user1234" + "</b></p>", // plaintext body

  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
      res.jsonp(req.shop);
    }

  });
  // res.jsonp(req.shop);
};
/**
 * Create a Shop
 */

exports.cookingBeforeCreate = function (req, res, next) {
  req.shop = {
    name: req.body.name,
    address: {
      address: req.body.vicinity,
      lat: req.body.lat,
      lng: req.body.lng
    },
    tel: req.body.phone,
    coverimage: req.body.img,
    importform: req.body.importForm
  };
  next();
};


exports.create = function (req, res) {
  var shop = new Shop(req.body);
  shop.user = req.user;

  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // console.log('shop' + shop);
      res.jsonp(shop);
    }
  });
};

/**
 * Show the current Shop
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var shop = req.shop ? req.shop.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  shop.isCurrentUserOwner = req.user && shop.user && shop.user._id.toString() === req.user._id.toString();
  shop.items.forEach(function (item) {
    item.products.forEach(function (i) {
      if (i.promotionprice) {
        var startdate = new Date(i.startdate);
        startdate.setHours(0, 0, 0);
        var expiredate = new Date(i.expiredate);
        expiredate.setDate(expiredate.getDate() + 1);
        expiredate.setHours(0, 0, 0);
        var today = new Date();
        if (today > startdate && today < expiredate) {
          i.price = i.promotionprice ? i.promotionprice : i.price;
        }
      }
    });
  });
  res.jsonp(shop);
};

/**
 * Update a Shop
 */
exports.update = function (req, res) {
  var shop = req.shop;

  shop = _.extend(shop, req.body);

  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shop);
    }
  });
};

/**
 * Delete an Shop
 */
exports.delete = function (req, res) {
  var shop = req.shop;

  shop.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shop);
    }
  });
};

/**
 * List of Shops
 */


exports.list = function (req, res) {

  Shop.find().sort('name').populate('user', 'firstName').populate('shopowner', 'firstName').exec(function (err, shop) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.shops = shop;
      res.jsonp(req.shops);
    }
  });
};


/**
 * Shop middleware
 */
exports.shopByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shop is invalid'
    });
  }

  Shop.findById(id).populate('user').populate('categories').populate({
    path: 'items',
    populate: [{
      path: 'cate',
      model: 'Categoryproduct'
    },
    {
      path: 'products',
      model: 'Product'
    }
    ]
  }).exec(function (err, shop) {
    if (err) {
      return next(err);
    } else if (!shop) {
      return res.status(404).send({
        message: 'No Shop with that identifier has been found'
      });
    }
    req.shop = shop;
    next();
  });
};


exports.createUserByShop = function (req, res, next) {
  var shop = req.shop;
  if (req.user && req.user.roles[0] === 'admin') {
    var firstname = shop.name ? shop.name : shop.name;
    var lastname = shop.name ? shop.name : shop.name;
    var newUser = new User({
      firstName: firstname,
      lastName: lastname,
      displayName: firstname + ' ' + lastname,
      email: shop.email,
      mobile: shop.tel,
      username: shop.email,
      password: 'user1234',
      provider: 'local',
      roles: ['shop']
    });
    User.find({
      username: newUser.username
    }).exec(function (err, users) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        if (users && users.length > 0) {
          req.usernew = users[0];
          next();
        } else {
          newUser.save(function (err) {
            if (err) {
              return res.status(400).send({
                message: 'genUser ' + errorHandler.getErrorMessage(err)
              });
            } else {
              req.usernew = newUser;
              next();
            }
          });
        }
        // res.jsonp(req.shops);
      }
    });

  } else {
    next();
  }
};

exports.updateUserShop = function (req, res, next) {
  var shop = req.shop;
  Shop.findById(shop._id).populate('user').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: 'Update Shop ' + errorHandler.getErrorMessage(err)
      });
    } else {
      shops.shopowner = req.usernew;
      shops.issendmail = true;
      shops.isactiveshop = true;

      shops.save(function (err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          User.populate(shops, {
            path: "shopowner"
          }, function (err, shopsRes) {
            req.shop = shopsRes;
            next();
          });
        }
      });
    }
  });
};


///////////////// filter /////////////////////
exports.getShop = function (req, res, next) {
  req.shopRes = [{
    name: 'รายการร้านค้า',
    items: []
  }, {
    name: 'ร้านค้าใหม่',
    items: []
  }, {
    name: 'official',
    items: []
  }, {
    name: 'ร้านฝากซื้อ',
    items: []
  }];
  next();
};

exports.cookingAll = function (req, res, next) {
  Shop.find({}, '_id name name_eng detail address tel email facebook line promoteimage coverimage isactiveshop issendmail importform times categories user').sort('name').populate('categories').populate('user', 'firstName').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.shopRes[0].items = shops;
      next();
    }
  });
};

exports.cookingNew = function (req, res, next) {
  Shop.find({}, '_id name name_eng detail address tel email facebook line promoteimage coverimage isactiveshop issendmail importform times categories user').sort('-created').populate('categories').populate('user', 'firstName').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.shopRes[1].items = shops;
      next();
    }
  });
};

exports.cookingOfficial = function (req, res, next) {
  Shop.find({}, '_id name name_eng detail address tel email facebook line promoteimage coverimage isactiveshop issendmail importform times categories user').sort('name').populate('categories').populate('user', 'firstName').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (shops && shops.length > 0) {
        shops.forEach(function (shop) {
          if (shop.issendmail === true) {
            req.shopRes[2].items.push(shop);
          }
        });
        next();
      } else {
        next();
      }
    }
  });
};

exports.cookingConsignment = function (req, res, next) {
  Shop.find({}, '_id name name_eng detail address tel email facebook line promoteimage coverimage isactiveshop issendmail importform times categories user').sort('name').populate('categories').populate('user', 'firstName').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (shops && shops.length > 0) {
        shops.forEach(function (shop) {
          if (shop.issendmail === false && shop.isactiveshop === true) {
            req.shopRes[3].items.push(shop);
          }
        });
        next();
      } else {
        next();
      }
    }
  });
};

exports.listFilter = function (req, res) {
  res.jsonp({
    filtercate: req.shopRes
  });
};


exports.cookingHomeShop = function (req, res, next) {
  // console.log(req.user._id);
  Shop.find({
    shopowner: req.user._id
  }).sort('-created').populate('categories').populate({
    path: 'items',
    populate: [{
      path: 'cate',
      model: 'Categoryproduct'
    },
    {
      path: 'products',
      model: 'Product'
    }
    ]
  }).exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (shops && shops.length > 0) {
        req.shop = shops[0];
        next();
      } else {
        res.jsonp([]);
      }
    }
  });
};

exports.resHomeShop = function (req, res) {
  var shop = req.shop ? req.shop.toJSON() : {};
  var items = [];
  shop.items.forEach(function (itm) {
    var cookingItem = {
      cate: {
        _id: itm.cate._id,
        name: itm.cate.name,
        image: itm.cate.image
      },
      products: []
    };
    itm.products.forEach(function (i) {
      if (i.promotionprice) {
        var startdate = new Date(i.startdate);
        startdate.setHours(0, 0, 0);
        var expiredate = new Date(i.expiredate);
        expiredate.setDate(expiredate.getDate() + 1);
        expiredate.setHours(0, 0, 0);
        var today = new Date();
        if (today > startdate && today < expiredate) {
          cookingItem.products.push({
            _id: i.name === 'default' ? null : i._id,
            name: i.name === 'default' ? '' : i.name,
            image: i.images && i.images.length > 0 ? i.images[0] : './assets/imgs/add.jpg',
            price: i.promotionprice ? i.promotionprice : i.price,
            isrecommend: i.isrecommend,
            issale: i.issale ? i.issale : false,
            ispromotionprice: true,
            startdate: startdate,
            expiredate: expiredate
          });
        } else {
          cookingItem.products.push({
            _id: i.name === 'default' ? null : i._id,
            name: i.name === 'default' ? '' : i.name,
            image: i.images && i.images.length > 0 ? i.images[0] : './assets/imgs/add.jpg',
            price: i.name === 'default' ? null : i.price,
            isrecommend: i.isrecommend,
            issale: i.issale ? i.issale : false,
            ispromotionprice: false,
            startdate: startdate,
            expiredate: expiredate
          });
        }

      } else {
        cookingItem.products.push({
          _id: i.name === 'default' ? null : i._id,
          name: i.name === 'default' ? '' : i.name,
          image: i.images && i.images.length > 0 ? i.images[0] : './assets/imgs/add.jpg',
          price: i.name === 'default' ? null : i.price,
          isrecommend: i.isrecommend,
          issale: i.issale ? i.issale : false,
          ispromotionprice: false,
          startdate: null,
          expiredate: null
        });
      }

    });
    items.push(cookingItem);
  });
  var resShop = {
    _id: shop._id,
    categories: shop.categories,
    name: shop.name,
    name_eng: shop.name_eng,
    detail: shop.detail,
    address: shop.address,
    tel: shop.tel,
    email: shop.email,
    facebook: shop.facebook || '',
    line: shop.line || '',
    promoteimage: shop.promoteimage,
    items: items,
    coverimage: shop.coverimage,
    isactiveshop: shop.isactiveshop,
    issendmail: shop.issendmail,
    importform: shop.importform,
    times: shop.times,
    islaunch: shop.islaunch,
    isopen: true
  };
  res.jsonp(resShop);
};


exports.cookingAdminHome = function (req, res, next) {
  var listname = ['รายการร้านค้า', 'ร้านค้าใหม่', 'official', 'ร้านฝากซื้อ'];

  req.listhome = listname;
  next();
};

exports.countPaging = function (req, res, next) {
  var numpage = [];
  Shop.find().sort('name').populate('categories').populate('user', 'firstName').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (shops && shops.length > 0) {
        var pages = shops.length / 10;
        var pagings = Math.ceil(pages);
        req.items = shops.slice(0, 10);
        for (var i = 0; i < pagings; i++) {
          numpage.push(i + 1);
        }

      }
      req.paging = numpage;
      next();
    }
  });
};

exports.listHome = function (req, res) {
  res.jsonp({
    name: req.listhome,
    pagings: req.paging,
    items: req.items
  });
};

exports.sortName = function (req, res, next) {
  var firstIndex = 0;
  var lastIndex = 10;
  if (req.body.currentpage > 1) {
    firstIndex = ((req.body.currentpage - 1) * 10);
    lastIndex = (req.body.currentpage * 10);
  }
  if (req.body.typename === 'รายการร้านค้า') {
    var numpage = [];
    var keywords = {};
    if (req.body.keyword) {
      keywords = searchKeyword(req.body.keyword);
    }
    Shop.find(keywords).sort('name').populate('categories').populate('user', 'firstName').exec(function (err, shops) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.pagings = countPage(shops);
        req.items = shops.slice(firstIndex, lastIndex);
        next();
      }
    });
  } else {
    next();
  }

};

exports.sortDate = function (req, res, next) {
  var firstIndex = 0;
  var lastIndex = 10;
  if (req.body.currentpage > 1) {
    firstIndex = ((req.body.currentpage - 1) * 10);
    lastIndex = (req.body.currentpage * 10);
  }
  if (req.body.typename === 'ร้านค้าใหม่') {
    var numpage = [];
    var keywords = {};
    if (req.body.keyword) {
      keywords = searchKeyword(req.body.keyword);
    }
    Shop.find(keywords).sort('-created').populate('categories').populate('user', 'firstName').exec(function (err, shops) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.pagings = countPage(shops);
        req.items = shops.slice(firstIndex, lastIndex);
        next();
      }
    });
  } else {
    next();
  }

};

exports.sortOfficial = function (req, res, next) {
  var firstIndex = 0;
  var lastIndex = 10;
  if (req.body.currentpage > 1) {
    firstIndex = ((req.body.currentpage - 1) * 10);
    lastIndex = (req.body.currentpage * 10);
  }
  if (req.body.typename === 'official') {
    var numpage = [];
    var keywords = {};
    if (req.body.keyword) {
      keywords = searchKeyword(req.body.keyword);
    }
    Shop.find(keywords).sort('name').where('issendmail').equals(true).populate('categories').populate('user', 'firstName').exec(function (err, shops) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.pagings = countPage(shops);
        req.items = shops.slice(firstIndex, lastIndex);
        next();
      }
    });
  } else {
    next();
  }

};

exports.sortUnofficial = function (req, res, next) {
  var firstIndex = 0;
  var lastIndex = 10;
  if (req.body.currentpage > 1) {
    firstIndex = ((req.body.currentpage - 1) * 10);
    lastIndex = (req.body.currentpage * 10);
  }
  if (req.body.typename === 'ร้านฝากซื้อ') {
    var numpage = [];
    var keywords = {};
    if (req.body.keyword) {
      keywords = searchKeyword(req.body.keyword);
    }
    Shop.find(keywords).sort('name').where('issendmail').equals(false).populate('categories').populate('user', 'firstName').exec(function (err, shops) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.pagings = countPage(shops);
        req.items = shops.slice(firstIndex, lastIndex);
        next();
      }
    });
  } else {
    next();
  }

};

exports.filterPage = function (req, res) {
  var data = req.body;
  res.jsonp({
    items: req.items,
    pagings: req.pagings
  });
};

exports.changeCover = function (req, res, next) {
  var shop = req.shop;
  shop.coverimage = req.body.data;
  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.shop = shop;
      next();
    }
  });
};

exports.resShopData = function (req, res) {
  var shop = req.shop ? req.shop.toJSON() : {};
  // console.log('ddddddddd' +shop.items);
  // console.log(shop.items);

  var items = [];
  shop.items.forEach(function (itm) {
    var cookingItem = {
      cate: {
        _id: itm.cate._id,
        name: itm.cate.name,
        image: itm.cate.image
      },
      products: []
    };
    itm.products.forEach(function (i) {
      cookingItem.products.push({
        _id: i.name === 'default' ? null : i._id,
        name: i.name === 'default' ? '' : i.name,
        image: i.images && i.images.length > 0 ? i.images[0] : './assets/imgs/add.jpg',
        price: i.name === 'default' ? null : i.price
      });
    });
    items.push(cookingItem);
  });
  var resShop = {
    _id: shop._id,
    name: shop.name,
    detail: shop.detail,
    address: shop.address,
    tel: shop.tel,
    email: shop.email,
    facebook: shop.facebook || '',
    line: shop.line || '',
    promoteimage: shop.promoteimage,
    items: items,
    coverimage: shop.coverimage,
    isactiveshop: shop.isactiveshop,
    issendmail: shop.issendmail,
    importform: shop.importform,
    times: shop.times,
    isopen: true
  };
  res.jsonp(resShop);
};

exports.addPromote = function (req, res, next) {
  var shop = req.shop;
  shop.promoteimage.unshift(req.body.data);
  if (shop.promoteimage.length > 10) {
    return res.status(400).send({
      message: 'Promote images is limited.'
    });
  }
  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.shop = shop;
      next();
    }
  });
};

exports.createCate = function (req, res, next) {
  var cate = new Categoryproduct(req.body);
  cate.shop = req.shop;
  cate.user = req.user;
  cate.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.cate = cate;
      next();
    }
  });
};

exports.addCateToShop = function (req, res, next) {
  var shop = req.shop;
  shop.items.push({
    cate: req.cate,
    products: []
  });
  var index = 0;
  if (shop.items && shop.items.length > 0) {
    shop.items.forEach(function (itm, i) {
      if (itm.cate === req.cate._id) {
        index = i;
      }
    });
    for (var i = 0; i < 30; i++) {
      shop.items[index].products.push(req.defaultProd);
    }
  }


  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      Shop.findById(shop._id).populate('user').populate('categories').populate({
        path: 'items',
        populate: [{
          path: 'cate',
          model: 'Categoryproduct'
        },
        {
          path: 'products',
          model: 'Product'
        }
        ]
      }).exec(function (err, shop) {
        if (err) {
          return next(err);
        } else if (!shop) {
          return res.status(404).send({
            message: 'No Shop with that identifier has been found'
          });
        }
        req.shop = shop;
        next();
      });
    }
  });
};

exports.createProduct = function (req, res, next) {
  var product = new Product(req.body);
  product.shop = req.shop;
  product.user = req.user;
  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.product = product.toJSON();
      next();
    }
  });
};

exports.defaultProduct = function (req, res, next) {
  Product.find({
    name: 'default'
  }).exec(function (err, defaultProd) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (defaultProd && defaultProd.length > 0) {
        req.defaultProd = defaultProd[0];
        next();
      } else {
        var product = new Product({
          name: 'default'
        });
        product.save(function (err) {
          if (err) {
            console.log(err);
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            // console.log(product);
            req.defaultProd = product.toJSON();
            next();
          }
        });
      }
    }
  });
};

exports.addProductToShop = function (req, res, next) {
  var shop = req.shop;
  var index = parseInt(req.body.index);
  var cateindex = parseInt(req.body.cateindex);
  var items = shop.items[cateindex].products ? shop.items[cateindex].products : [];
  for (var i = 0; i < 30; i++) {
    if (i === index) {
      items[i] = req.product;
    }
  }
  shop.items[cateindex].products = items;
  shop.save(function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.shop = shop;
      next();
    }
  });
};

exports.editShop = function (req, res) {
  var shop = req.shop;
  var _shop = req.body;
  shop.categories = _shop.categories;
  shop.name = _shop.name;
  shop.name_eng = _shop.name_eng;
  shop.detail = _shop.detail;
  shop.tel = _shop.tel;
  shop.email = _shop.email;
  shop.address = _shop.address;
  shop.line = _shop.line;
  shop.facebook = _shop.facebook;
  shop.times = _shop.times;
  shop.coverimage = _shop.coverimage;
  shop.othercontact = _shop.othercontact;
  shop.save(function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shop);
    }
  });
};



exports.updateUser = function (req, res, next) {
  var _user = req.body;
  User.findById(req.user._id).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return res.status(404).send({
        message: 'User not found'
      });
    }
    user.firstName = _user.firstName;
    user.lastName = _user.lastName;
    user.displayName = _user.firstName + ' ' + _user.lastName;
    user.profileImageURL = _user.profileImageURL;
    user.dateOfBirth = _user.dateOfBirth;
    user.citizenid = _user.citizenid;
    user.bankaccount = _user.bankaccount;

    user.save(function (err) {
      if (err) {
        console.log(err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.updateuser = user;
        next();
      }
    });
  });
};

exports.findShopUser = function (req, res, next) {
  Shop.find({
    shopowner: req.user._id
  }).sort('-created').populate('categories').populate({
    path: 'items',
    populate: [{
      path: 'cate',
      model: 'Categoryproduct'
    },
    {
      path: 'products',
      model: 'Product'
    }
    ]
  }).exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (shops && shops.length > 0) {
        req.shop = shops[0];
        next();
      } else {
        return res.status(400).send({
          message: 'no shop'
        });
      }
    }
  });
};

exports.updateShop = function (req, res, next) {
  var _shop = req.body;
  Shop.findById(req.shop._id).sort('-created')
    .populate('categories')
    .populate({
      path: 'items',
      populate: [{
        path: 'cate',
        model: 'Categoryproduct'
      },
      {
        path: 'products',
        model: 'Product'
      }
      ]
    }).exec(function (err, shop) {
      if (err) {
        return next(err);
      } else if (!shop) {
        return res.status(404).send({
          message: 'shop not found'
        });
      }
      shop.categories = _shop.categories;
      shop.coverimage = _shop.coverimage;
      shop.name = _shop.name;
      shop.name_eng = _shop.name_eng;
      shop.detail = _shop.detail;
      shop.email = _shop.email;
      shop.facebook = _shop.facebook;
      shop.line = _shop.line;
      shop.tel = _shop.tel;
      shop.times = _shop.times;
      shop.address = _shop.address;
      shop.islaunch = true;
      shop.save(function (err) {
        if (err) {
          console.log(err);
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          req.updateshop = shop;
          next();
        }
      });
    });
};

exports.shopInfo = function (req, res) {
  res.jsonp({
    shop: req.updateshop,
    user: req.updateuser
  });
};

exports.getShopsName = function (req, res) {
  Shop.find({}, 'name').sort('-created').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shops);
    }
  });
};

exports.deleteProductUpdateShop = function (req, res, next) {
  var shop = req.shop;
  var index = parseInt(req.body.index);
  var cateindex = parseInt(req.body.cateindex);
  var items = shop.items[cateindex].products ? shop.items[cateindex].products : [];
  items[index] = req.defaultProd._id;
  shop.items[cateindex].products = items;
  shop.save(function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.shop = shop;
      next();
    }
  });
};
exports.checkShopByName = function (req, res, next) {
  var shopfind = [];
  Shop.find({}, 'name').sort('-created').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.body.forEach(function (imp) {
        var findshop = shops.filter(function (obj) {
          return obj.name.toString() === imp.name.toString();
        });
        if (findshop.length > 0) {
          imp.ishave = true;
          shopfind.push(imp);
        } else {
          imp.ishave = false;
          shopfind.push(imp);
        }
      });
      req.shopfind = shopfind;
      next();
    }
  });
};
exports.deleteProduct = function (req, res, next) {
  Product.findById(req.body._id).exec(function (err, product) {
    if (err) {
      return next(err);
    } else if (!product) {
      return res.status(404).send({
        message: 'No product with that identifier has been found'
      });
    }
    product.remove(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        next();
      }
    });
  });
};

exports.listShopByName = function (req, res) {
  res.jsonp({
    shopfind: req.shopfind
  });
};

exports.cateProductByID = function (req, res, next) {
  var cateId = req.body.cateId;
  req.cateId = cateId;
  Categoryproduct.findById(cateId).exec(function (err, category) {
    if (err) {
      return next(err);
    } else if (!category) {
      return res.status(404).send({
        message: 'No category with that identifier has been found'
      });
    }
    req.category = category;
    next();
  });
};

exports.findAllProduct = function (req, res, next) {
  // categories
  Product.find({
    categories: req.cateId
  }, '_id').exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (products && products.length > 0) {
        req.productIDs = products;
        next();
      } else {
        next();
      }
    }
  });
};

exports.deleteAllProduct = function (req, res, next) {
  Product.remove({
    user: req.user._id,
    _id: {
      $in: req.productIDs
    }
  }).exec(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      next();
    }
  });
};

exports.shopSliceItems = function (req, res, next) {
  // console.log(req.shop.items);
  var indexCate = 0;
  var shop = req.shop;
  shop.items.forEach(function (item, i) {
    if (item.cate._id.toString() === req.body.cateId.toString()) {
      indexCate = i;
    }
  });
  // console.log(shop.items[0].cate);  
  // console.log(shop.items[1].cate);  
  // console.log(shop.items[2].cate);  
  shop.items.splice(indexCate, 1);
  // console.log(shop.items[0].cate);  
  // console.log(shop.items[1].cate);  
  shop.save(function (err) {
    if (err) {
      console.log(err);
    }
    req.shop = shop;
    // console.log(req.shop.items);    
    next();
  });
};

exports.deleteCateProduct = function (req, res, next) {
  req.category.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      next();
    }
  });
};

exports.resDeleteCate = function (req, res) {
  res.jsonp(req.shop);
};

exports.removePromote = function (req, res) {
  var shop = req.shop;
  shop.promoteimage.splice(req.body.index, 1);
  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // req.shop = shop;
      res.jsonp(shop);
    }
  });
};

exports.shopUpdateItems = function (req, res) {
  var shop = req.shop;
  var items = [];
  req.body.items.forEach(function (itm) {
    var data = {
      cate: itm.cate._id,
      products: []
    };
    itm.products.forEach(function (itmp) {
      if (!itmp._id) {
        data.products.push(req.defaultProd._id);
      } else {
        data.products.push(itmp._id);
      }
    });
    items.push(data);
  });
  shop.items = items;
  shop.save(function (err) {
    if (err) {
      console.log(err);
    }
    res.jsonp(shop);
  });
};

exports.cookingShopDetail = function (req, res, next) {
  var cusShopDetail = {
    _id: req.shop._id,
    name: req.shop.name,
    detail: req.shop.detail,
    isopen: true,
    address: {
      addressdetail: req.shop.address.addressdetail ? req.shop.address.addressdetail : ''
    },
    promoteimage: req.shop.promoteimage,
    coverimage: req.shop.coverimage,
    times: req.shop.times,
    categories: [],
    products: []
  };
  req.cusShopDetail = cusShopDetail;
  next();
};

exports.getCateByShop = function (req, res, next) {
  Categoryproduct.find({
    shop: req.shop._id
  }).exec(function (err, categorys) {
    if (err) {
      return next(err);
    } else if (!categorys) {
      return res.status(404).send({
        message: 'No category with that identifier has been found'
      });
    }
    if (req.shop.items && req.shop.items.length > 0) {
      req.shop.items.forEach(function (itm) {
        if (categorys && categorys.length > 0) {
          categorys.forEach(function (cate) {
            // console.log(itm.cate.toString() + ' ' + cate._id.toString());
            if (itm.cate._id.toString() === cate._id.toString()) {
              req.cusShopDetail.categories.push({
                _id: cate._id,
                name: cate.name,
                image: cate.image
              });
            }
          });
        }
      });
    }

    next();
  });
};

exports.getProductsByShop = function (req, res, next) {
  Product.find({
    shop: req.shop._id,
    issale: true
  }).exec(function (err, products) {
    if (err) {
      return next(err);
    } else if (!products) {
      return res.status(404).send({
        message: 'No products with that identifier has been found'
      });
    }
    if (req.shop.items && req.shop.items.length > 0) {
      req.shop.items.forEach(function (itm) {
        if (itm.products && itm.products.length > 0) {
          itm.products.forEach(function (product) {
            if (products && products.length > 0) {
              products.forEach(function (prod) {
                if (product._id.toString() === prod._id.toString()) {
                  var startdate = new Date(prod.startdate);
                  startdate.setHours(0, 0, 0);
                  var expiredate = new Date(prod.expiredate);
                  expiredate.setDate(expiredate.getDate() + 1);
                  expiredate.setHours(0, 0, 0);
                  var today = new Date();
                  if (prod.promotionprice && today > startdate && today < expiredate) {
                    req.cusShopDetail.products.push({
                      _id: prod._id,
                      cateid: prod.categories,
                      name: prod.name,
                      image: prod.images ? prod.images[0] : 'no image',
                      price: prod.promotionprice ? prod.promotionprice : prod.price,
                      ispromotion: prod.ispromotionprice ? prod.ispromotionprice : false,
                      popularcount: 0,
                      isrecommend: prod.isrecommend ? prod.isrecommend : false
                    });
                  } else {
                    req.cusShopDetail.products.push({
                      _id: prod._id,
                      cateid: prod.categories,
                      name: prod.name,
                      image: prod.images ? prod.images[0] : 'no image',
                      price: prod.price,
                      ispromotion: prod.ispromotionprice ? prod.ispromotionprice : false,
                      popularcount: 0,
                      isrecommend: prod.isrecommend ? prod.isrecommend : false
                    });
                  }
                }
              });
            }
          });
        }
      });
    }

    next();
  });
};

exports.shopDetail = function (req, res) {
  res.jsonp(req.cusShopDetail);
};

exports.searchShopKeyword = function (req, res, next) {
  var keywords = {};
  if (req.body.keywordname) {
    keywords = searchName(req.body.keywordname);
  }
  Shop.find(keywords).sort('name').populate('categories').populate('user', 'firstName').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var dataShop = [];
      if (shops && shops.length > 0) {
        shops.forEach(function (data) {
          dataShop.push({
            _id: data._id,
            name: data.name,
            rating: data.rating,
            distance: null,
            image: data.coverimage,
            isAds: false
          });
        });
      }
      req.shops = dataShop;
      next();
    }
  });
};

exports.searchProductKeyword = function (req, res, next) {
  var keywords = {};
  if (req.body.keywordname) {
    keywords = searchName(req.body.keywordname);
  }
  Product.find(keywords).sort('name').populate('categories').populate('user', 'firstName').exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var dataProduct = [];
      if (products && products.length > 0) {
        products.forEach(function (data) {
          dataProduct.push({
            _id: data._id,
            cateid: data.categories._id,
            name: data.name,
            image: data.images[0],
            price: data.ispromotionprice ? data.promotionprice : data.price
          });
        });
      }
      req.products = dataProduct;
      next();
    }
  });
};

exports.resSearch = function (req, res) {
  res.jsonp({
    shops: req.shops,
    products: req.products
  });
};

exports.shopPageLimit = function (req, res, next, shoppage) {
  req.limitShop = shoppage;
  next();
};

exports.getShopsList = function (req, res) {

  Shop.find({
    islaunch: true
  }, '_id coverimage').sort('-created').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var resultItem = shops;
      var maxLimit = shops.length;
      var limitItem = shops.length;
      if (req.limitShop !== 'all') {
        var lastIndex = req.limitShop * 15;
        var itemsLimit = shops.slice(0, lastIndex);
        limitItem = lastIndex;
        resultItem = itemsLimit;
      }
      res.jsonp({
        items: resultItem,
        limitItem: limitItem,
        maxLimit: maxLimit
      });
    }
  });

};
//count page
function countPage(shops) {
  var numpage = [];
  if (shops && shops.length > 0) {
    var pages = shops.length / 10;
    var pagings = Math.ceil(pages);
    for (var i = 0; i < pagings; i++) {
      numpage.push(i + 1);
    }

  }
  return numpage;
}

//search keyword
function searchKeyword(keyWord) {
  var keyword = {
    $or: [{
      'name': {
        '$regex': keyWord,
        '$options': 'i'
      }
    },
    {
      'detail': {
        '$regex': keyWord,
        '$options': 'i'
      }
    },
    {
      'tel': {
        '$regex': keyWord,
        '$options': 'i'
      }
    }
    ]
  };
  return keyword;
}

function searchName(keyWordName) {
  var keywordname = {
    $or: [{
      'name': {
        '$regex': keyWordName,
        '$options': 'i'
      }
    }]
  };
  return keywordname;
}
