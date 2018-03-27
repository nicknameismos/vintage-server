'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  cloudinary = require(path.resolve('./config/lib/cloudinary')).cloudinary,
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/** 
 * Upload Images Product
 */
exports.changeProductPicture = function (req, res) {
  // var user = req.user;
  var message = null;
  // var upload = multer(config.uploads.productUpload).single('newProfilePicture');
  // var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

  // // Filtering to upload only images
  // upload.fileFilter = profileUploadFileFilter;
  // // if (user) {
  // upload(req, res, function (uploadError) {
  //   if (uploadError) {
  //     return res.status(400).send({
  //       message: 'Error occurred while uploading profile picture'
  //     });
  //   } else {
  var cloudImageURL = 'data:image/png;base64,' + req.body.data;
  // console.log(cloudImageURL);
  cloudinary.uploader.upload(cloudImageURL, function (result) {
    var imageURL = result.url;
    res.json({
      status: '000',
      message: 'success',
      imageURL: imageURL
    });
  });
};
// });
// } else {
//   res.status(400).send({
//     message: 'User is not signed in'
//   });
// }


/**
 * Create a Product
 */
exports.create = function (req, res) {
  var product = new Product(req.body);
  product.user = req.user;

  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(product);
    }
  });
};

/**
 * Show the current Product
 */
exports.read = function (req, res, next) {
  // convert mongoose document to JSON
  var product = req.product;
  var startdate = new Date(product.startdate);
  startdate.setHours(0, 0, 0);
  var expiredate = new Date(product.expiredate);
  expiredate.setDate(expiredate.getDate() + 1);
  expiredate.setHours(0, 0, 0);
  var today = new Date();
  if (product.ispromotionprice && today > startdate && today < expiredate) {
    res.jsonp(product);
  } else {
    next();
  }
};

exports.clearExpire = function (req, res) {
  var product = req.product;
  product.ispromotionprice = false;
  product.startdate = '';
  product.expiredate = '';
  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(product);
    }
  });
};

/**
 * Update a Product
 */

exports.isPromotionprice = function (req, res, next) {
  var product = req.product;
  if (req.body.ispromotionprice) {
    product.ispromotionprice = req.body.ispromotionprice;
    product.startdate = req.body.startdate ? req.body.startdate : product.startdate;
    product.expiredate = req.body.expiredate ? req.body.expiredate : product.expiredate;
    req.product = product;
    next();
  } else {
    product.ispromotionprice = false;
    product.startdate = '';
    product.expiredate = '';
    req.product = product;
    next();
  }
};


exports.update = function (req, res) {
  var product = req.product;

  // product = _.extend(product, req.body);
  product.images = req.body.images ? req.body.images : product.images;
  product.name = req.body.name ? req.body.name : product.name;
  product.detail = req.body.detail ? req.body.detail : product.detail;
  product.price = req.body.price ? req.body.price : product.price;
  product.promotionprice = req.body.promotionprice ? req.body.promotionprice : product.promotionprice;
  product.isrecommend = req.body.isrecommend;
  product.issale = req.body.issale;
  product.shippings = req.body.shippings ? req.body.shippings : [];


  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(product);
    }
  });
};

/**
 * Delete an Product
 */
exports.delete = function (req, res) {
  var product = req.product;

  product.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(product);
    }
  });
};

/**
 * List of Products
 */
exports.list = function (req, res) {
  Product.find().sort('-created').populate('user', 'displayName').populate('categories').populate('shop').populate('shippings.ref').exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(products);
    }
  });
};

/**
 * Product middleware
 */
exports.productByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Product is invalid'
    });
  }

  Product.findById(id).populate('user', 'displayName').populate('categories').populate('shop').populate('shippings.ref').exec(function (err, product) {
    if (err) {
      return next(err);
    } else if (!product) {
      return res.status(404).send({
        message: 'No Product with that identifier has been found'
      });
    }
    req.product = product;
    next();
  });
};


exports.shopID = function (req, res, next, shopid) {
  Product.find({
    shop: shopid
  }, '_id name images price categories priorityofcate recommend').sort('-created').populate('user', 'displayName').populate('categories').exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.products = products;
      next();
    }
  });
};

exports.cookingProductList = function (req, res, next) {
  var products = [];
  // console.log(req.products);
  req.products.forEach(function (element) {
    // var categories = [];
    // element.categories.forEach(function (cate) {
    //   categories.push({
    //     name: cate.name
    //   });
    // });
    products.push({
      _id: element._id,
      name: element.name,
      images: element.images[0],
      price: element.price,
      priorityofcate: element.priorityofcate,
      categories: element.categories,
      recommend: element.recommend
    });
  });
  req.productsCookingList = products;
  next();
};

exports.productByShop = function (req, res) {
  // console.log('data' + JSON.stringify(req.productsCookingList));
  res.jsonp({
    items: req.productsCookingList ? req.productsCookingList : []
  });
};

exports.getShopID = function (req, res, next, shopid) {
  Product.find({
    shop: shopid,
    issale: true
  }, '_id name images price categories ispromotionprice isrecommend detail shippings').sort('-created').populate('user', 'displayName').populate('categories').populate('shippings.ref').exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.products = products;
      next();
    }
  });
};

exports.getListProduct = function (req, res, next) {
  var products = [];
  req.products.forEach(function (element) {
    products.push({
      _id: element._id,
      name: element.name,
      image: element.images[0],
      price: element.price,
      cateid: element.categories._id,
      ispromotion: element.ispromotionprice,
      isrecommend: element.isrecommend,
      detail: element.detail,
      ispopular: false,
      shippings: element.shippings
    });
  });
  req.getProducList = products;
  next();
};

exports.getProductListByShop = function (req, res) {
  res.jsonp(req.getProducList);
};

exports.productDetail = function (req, res) {
  var productDB = req.product ? req.product.toJSON() : {};
  var product = {
    _id: productDB._id,
    name: productDB.name,
    images: productDB.images,
    price: productDB.ispromotionprice ? productDB.promotionprice : productDB.price,
    detail: productDB.detail,
    shippings: productDB.shippings,
    shopid: productDB.shop ? productDB.shop._id : '',
    shop: productDB.shop,
    ispromotion: productDB.ispromotionprice || false,
    isrecommend: productDB.isrecommend || false,
    ispopular: false
  };
  product.isCurrentUserOwner = req.user && product.user && product.user._id.toString() === req.user._id.toString();
  res.jsonp(product);
};
