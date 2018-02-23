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
  Bid = mongoose.model('Bid'),
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
  // console.log(order);
  if (order.coupon && order.coupon.code) {
    Coupon.find({
      code: order.coupon.code
    }).exec(function (err, coupons) {
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
  // console.log(order);
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

exports.create = function (req, res, next) {
  var order = new Order(req.body);
  var _order = req.body;
  order.omiseresponse = order.payment.paymenttype === 'Credit Card' ? req.omiseresponse : order.omiseresponse;
  order.user = req.user;
  order.docno = +new Date();
  order.items.forEach(function (element, i) {
    element.product = _order.items[i].product._id;
    element.shopid = _order.items[i].product.shopid;
    element.unitprice = _order.items[i].product.price;
    element.status = _order.items[i].status ? _order.items[i].status : 'confirm';
    element.log.push({
      status: 'confirm'
    });
  });
  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.notidata = order;
      next();
      // res.jsonp(order);
    }
  });
};

exports.bidCreateOrder = function (req, res) {
  var order = req.order;
  var _order = req.body;
  order.omiseresponse = _order.payment && _order.payment.paymenttype === 'Credit Card' ? req.omiseresponse : {};
  order.itemsbid = _order.itemsbid ? _order.itemsbid : order.itemsbid;
  order.itemsbid[0].status = 'confirm';
  order.itemsbid[0].log.push({
    status: 'confirm'
  });
  order.omiseToken = _order.omiseToken || {};
  order.shippingAddress = _order.shippingAddress;
  order.coupon = _order.coupon || {};
  order.payment = _order.payment || {};
  order.discountamount = _order.discountamount || 0;
  order.shippingamount = _order.shippingamount || 0;
  order.totalamount = _order.totalamount ? _order.totalamount : order.totalamount;
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

  Order.findById(id).populate('user', 'displayName').populate('items.product').populate('itemsbid.bid').exec(function (err, order) {
    if (err) {
      return next(err);
    } else if (!order) {
      return res.status(404).send({
        message: 'No Order with that identifier has been found'
      });
    }

    order.populate({
      path: 'itemsbid',
      populate: {
        path: 'bid',
        populate: {
          path: 'shippings',
          populate: {
            path: 'ref',
            model: 'Shippingmaster'
          }
        }
      }
    }, function (err, orderPop) {
      req.order = orderPop;
      next();
    });

  });
};

exports.customerGetListOrder = function (req, res, next) {
  Order.find({
    user: {
      _id: req.user._id
    }
  }).sort('-created').populate('user', 'displayName').populate('items.product').populate('itemsbid.bid').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.orders = orders;
      next();
    }
  });
};

exports.customerCookingListOrder = function (req, res, next) {
  var resData = [{
    status: 'topay',
    items: []
  }, {
    status: 'confirm',
    items: []
  }, {
    status: 'sent',
    items: []
  }, {
    status: 'completed',
    items: []
  }, {
    status: 'cancel',
    items: []
  }];
  req.orders.forEach(function (order) {
    var canceldate = '';
    var remark = '';
    var sentdate = '';
    var sentdate2 = '';
    var completed2 = '';
    if (order.channel === 'bid') {
      order.itemsbid.forEach(function (itm) {
        if (itm.status === 'topay') {
          resData[0].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.bid && itm.bid.name ? itm.bid.name : '',
            image: itm.bid && itm.bid.image ? itm.bid.image[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name ? itm.shipping.ref.name : '',
            shippingprice: itm.shipping.price || 0,
            amount: itm.amount,
            sentdate: '',
            receivedate: '',
            canceldate: '',
            isrefund: false,
            status: 'topay',
            rejectreason: '',
            refid: itm.refid ? itm.refid : '',
            channel: order.channel
          });
        } else if (itm.status === 'confirm') {
          resData[1].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.bid && itm.bid.name ? itm.bid.name : '',
            image: itm.bid && itm.bid.image ? itm.bid.image[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name ? itm.shipping.ref.name : '',
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            sentdate: '',
            receivedate: '',
            canceldate: '',
            isrefund: false,
            status: 'confirm',
            rejectreason: '',
            refid: itm.refid ? itm.refid : '',
            channel: order.channel
          });
        } else if (itm.status === 'sent') {
          if (itm.log && itm.log.length > 0) {
            itm.log.forEach(function (it) {
              if (it.status === 'sent') {
                sentdate = it.created;
              }
            });
          }
          resData[2].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.bid && itm.bid.name ? itm.bid.name : '',
            image: itm.bid && itm.bid.image ? itm.bid.image[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name ? itm.shipping.ref.name : '',
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            sentdate: sentdate,
            receivedate: '',
            canceldate: '',
            isrefund: false,
            status: 'sent',
            rejectreason: '',
            refid: itm.refid ? itm.refid : '',
            channel: order.channel
          });
        } else if (itm.status === 'completed' || itm.status === 'transferred') {

          if (itm.log && itm.log.length > 0) {
            itm.log.forEach(function (it) {
              if (it.status === 'sent') {
                sentdate2 = it.created;
              } else if (it.status === 'completed') {
                completed2 = it.created;
              }
            });
          }
          resData[3].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.bid && itm.bid.name ? itm.bid.name : '',
            image: itm.bid && itm.bid.image ? itm.bid.image[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name ? itm.shipping.ref.name : '',
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            sentdate: sentdate2,
            receivedate: completed2,
            canceldate: '',
            isrefund: false,
            status: itm.status,
            rejectreason: '',
            refid: itm.refid ? itm.refid : '',
            channel: order.channel
          });
        } else if (itm.status === 'cancel' || itm.status === 'admincancel' || itm.status === 'reject' || itm.status === 'rejectrefund' || itm.status === 'cancelrefund' || itm.status === 'admincancelrefund') {

          if (itm.log && itm.log.length > 0) {
            itm.log.forEach(function (it) {
              if (it.status === 'cancel') {
                canceldate = it.created;
              } else if (it.status === 'reject') {
                canceldate = it.created;
                remark = itm.remark;
              } else if (it.status === 'rejectrefund') {
                canceldate = it.created;
                remark = itm.remark;
              } else if (it.status === 'cancelrefund') {
                canceldate = it.created;
              } else if (it.status === 'admincancelrefund') {
                canceldate = it.created;
              } else if (it.status === 'admincancel') {
                canceldate = it.created;
              }
            });
          }
          resData[4].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.bid && itm.bid.name ? itm.bid.name : '',
            image: itm.bid && itm.bid.image ? itm.bid.image[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name ? itm.shipping.ref.name : '',
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            sentdate: '',
            receivedate: '',
            canceldate: canceldate,
            isrefund: false,
            status: itm.status,
            rejectreason: remark,
            refid: itm.refid ? itm.refid : '',
            channel: order.channel
          });
        }

      });
    } else {
      order.items.forEach(function (itm) {
        if (itm.status === 'confirm') {
          resData[1].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.product && itm.product.name ? itm.product.name : '',
            image: itm.product && itm.product.images ? itm.product.images[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name ? itm.shipping.ref.name : '',
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            sentdate: '',
            receivedate: '',
            canceldate: '',
            isrefund: false,
            status: 'confirm',
            rejectreason: '',
            refid: itm.refid ? itm.refid : '',
            channel: order.channel
          });
        } else if (itm.status === 'sent') {
          // var sentdate = '';
          if (itm.log && itm.log.length > 0) {
            itm.log.forEach(function (it) {
              if (it.status === 'sent') {
                sentdate = it.created;
              }
            });
          }
          resData[2].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.product && itm.product.name ? itm.product.name : '',
            image: itm.product && itm.product.images ? itm.product.images[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name ? itm.shipping.ref.name : '',
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            sentdate: sentdate,
            receivedate: '',
            canceldate: '',
            isrefund: false,
            status: 'sent',
            rejectreason: '',
            refid: itm.refid ? itm.refid : '',
            channel: order.channel
          });
        } else if (itm.status === 'completed' || itm.status === 'transferred') {
          // var sentdate2 = '';
          // var completed2 = '';
          if (itm.log && itm.log.length > 0) {
            itm.log.forEach(function (it) {
              if (it.status === 'sent') {
                sentdate2 = it.created;
              } else if (it.status === 'completed') {
                completed2 = it.created;
              }
            });
          }
          resData[3].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.product && itm.product.name ? itm.product.name : '',
            image: itm.product && itm.product.images ? itm.product.images[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name ? itm.shipping.ref.name : '',
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            sentdate: sentdate2,
            receivedate: completed2,
            canceldate: '',
            isrefund: false,
            status: itm.status,
            rejectreason: '',
            refid: itm.refid ? itm.refid : '',
            channel: order.channel
          });
        } else if (itm.status === 'cancel' || itm.status === 'admincancel' || itm.status === 'reject' || itm.status === 'rejectrefund' || itm.status === 'cancelrefund' || itm.status === 'admincancelrefund') {
          // var canceldate = '';
          // var remark = '';
          if (itm.log && itm.log.length > 0) {
            itm.log.forEach(function (it) {
              if (it.status === 'cancel') {
                canceldate = it.created;
              } else if (it.status === 'reject') {
                canceldate = it.created;
                remark = itm.remark;
              } else if (it.status === 'rejectrefund') {
                canceldate = it.created;
                remark = itm.remark;
              } else if (it.status === 'cancelrefund') {
                canceldate = it.created;
              } else if (it.status === 'admincancelrefund') {
                canceldate = it.created;
              } else if (it.status === 'admincancel') {
                canceldate = it.created;
              }
            });
          }
          resData[4].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.product && itm.product.name ? itm.product.name : '',
            image: itm.product && itm.product.images ? itm.product.images[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name ? itm.shipping.ref.name : '',
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            sentdate: '',
            receivedate: '',
            canceldate: canceldate,
            isrefund: false,
            status: itm.status,
            rejectreason: remark,
            refid: itm.refid ? itm.refid : '',
            channel: order.channel
          });
        }
      });
    }
  });

  req.resData = resData;
  next();
};

exports.resList = function (req, res) {
  res.jsonp(req.resData);
};

exports.orderShopId = function (req, res, next, shopid) {
  // console.log(shopid);
  req.shopid = shopid;
  next();
};
exports.shopGetListOrder = function (req, res, next) {
  // console.log(req.user);
  Order.find({
    items: {
      $elemMatch: {
        shopid: req.shopid
      }
    }
  }).sort('-created').populate('user', 'displayName').populate('items.product').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.orders = orders;
      next();
    }
  });
};

exports.shopCookingListOrder = function (req, res, next) {
  var resData = [{
    status: 'confirm',
    items: []
  }, {
    status: 'sent',
    items: []
  }, {
    status: 'completed',
    items: []
  }, {
    status: 'cancel',
    items: []
  }];
  req.orders.forEach(function (order) {
    order.items.forEach(function (itm) {
      var sentdate = '';
      var condate = '';
      var receivedate = '';
      var canceldate = '';
      if (itm.shopid.toString() === req.shopid.toString()) {
        if (itm.status === 'confirm') {
          if (itm.log && itm.log.length > 0) {
            itm.log.forEach(function (it) {
              if (it.status === 'confirm') {
                condate = it.created;
              }
            });
          }
          resData[0].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.product && itm.product.name ? itm.product.name : '',
            image: itm.product && itm.product.images ? itm.product.images[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name,
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            confirmdate: condate,
            sentdate: sentdate,
            receivedate: receivedate,
            canceldate: canceldate,
            isrefund: false,
            status: 'confirm',
            rejectreason: '',
            refid: itm.refid ? itm.refid : ''
          });
        } else if (itm.status === 'sent') {
          if (itm.log && itm.log.length > 0) {
            itm.log.forEach(function (it) {
              if (it.status === 'sent') {
                sentdate = it.created;
              } else if (it.status === 'confirm') {
                condate = it.created;
              }
            });
          }
          resData[1].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.product && itm.product.name ? itm.product.name : '',
            image: itm.product && itm.product.images ? itm.product.images[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name,
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            confirmdate: condate,
            sentdate: sentdate,
            receivedate: receivedate,
            canceldate: canceldate,
            isrefund: false,
            status: 'sent',
            rejectreason: '',
            refid: itm.refid ? itm.refid : ''
          });
        } else if (itm.status === 'completed' || itm.status === 'transferred') {
          if (itm.log && itm.log.length > 0) {
            itm.log.forEach(function (it) {
              if (it.status === 'sent') {
                sentdate = it.created;
              } else if (it.status === 'completed') {
                receivedate = it.created;
              } else if (it.status === 'transferred') {
                receivedate = it.created;
              } else if (it.status === 'confirm') {
                condate = it.created;
              }
            });
          }
          resData[2].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.product && itm.product.name ? itm.product.name : '',
            image: itm.product && itm.product.images ? itm.product.images[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name,
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            confirmdate: condate,
            sentdate: sentdate,
            receivedate: receivedate,
            canceldate: canceldate,
            isrefund: false,
            status: itm.status,
            rejectreason: '',
            refid: itm.refid ? itm.refid : ''
          });
        } else if (itm.status === 'cancel' || itm.status === 'admincancel' || itm.status === 'reject' || itm.status === 'rejectrefund' || itm.status === 'cancelrefund' || itm.status === 'admincancelrefund') {
          var remark = '';
          if (itm.log && itm.log.length > 0) {
            itm.log.forEach(function (it) {
              if (it.status === 'cancel') {
                canceldate = it.created;
              } else if (it.status === 'reject') {
                canceldate = it.created;
                remark = itm.remark;
              } else if (it.status === 'admincancel') {
                canceldate = it.created;
                remark = itm.remark;
              }
            });
          }
          resData[3].items.push({
            itemid: itm._id,
            orderid: order._id,
            docno: order.docno ? order.docno : order._id,
            name: itm.product && itm.product.name ? itm.product.name : '',
            image: itm.product && itm.product.images ? itm.product.images[0] : '',
            price: itm.unitprice,
            qty: itm.qty,
            shippingtype: itm.shipping.ref.name,
            shippingprice: itm.shipping.price,
            amount: itm.amount,
            confirmdate: condate,
            sentdate: sentdate,
            receivedate: receivedate,
            canceldate: canceldate,
            isrefund: false,
            status: itm.status,
            rejectreason: remark,
            refid: itm.refid ? itm.refid : ''
          });
        }
      }
    });
  });
  req.resData = resData;
  next();
};

exports.orderItemId = function (req, res, next, itmId) {
  req.itm_id = itmId;
  next();
};

exports.findShop = function (req, res, next) {
  var id = '';
  if (req.order.channel === 'order') {
    req.order.items.forEach(function (itm, i) {
      if (itm._id.toString() === req.itm_id.toString()) {
        id = itm.shopid;
        req.itemIndex = i;
      }
    });
    Shop.findById(id).populate('user', 'displayName').exec(function (err, shop) {
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
  } else {
    req.order.itemsbid.forEach(function (itm, i) {
      if (itm._id.toString() === req.itm_id.toString()) {
        req.itemIndex = i;
      }
    });
    next();
  }

};

exports.cookingOrderDetail = function (req, res, next) {
  var confirmdate = '';
  var sentdate = '';
  var receiveddate = '';
  var canceldate = '';
  var transferdate = '';
  var refunddate = '';
  var topaydate = '';
  var resData = {};
  // console.log(req.order);
  if (req.order.channel === 'order') {
    req.order.items[req.itemIndex].log.forEach(function (l) {
      if (l.status.toString() === 'confirm') {
        confirmdate = l.created;
      } else if (l.status.toString() === 'sent') {
        sentdate = l.created;
      } else if (l.status.toString() === 'completed') {
        receiveddate = l.created;
      } else if (l.status.toString() === 'cancel' || l.status.toString() === 'reject' || l.status.toString() === 'admincancel') {
        canceldate = l.created;
      } else if (l.status.toString() === 'transferred') {
        transferdate = l.created;
      } else if (l.status.toString() === 'rejectrefund' || l.status.toString() === 'cancelrefund' || l.status.toString() === 'admincancelrefund') {
        refunddate = l.created;
      }
    });
    resData = {
      itemid: req.itm_id,
      orderid: req.order._id,
      docno: req.order.docno ? req.order.docno : req.order._id,
      shop: {
        _id: req.shop._id,
        name: req.shop.name
      },
      product: {
        _id: req.order.items[req.itemIndex].product._id,
        name: req.order.items[req.itemIndex].product.name,
        image: req.order.items[req.itemIndex].product.images && req.order.items[req.itemIndex].product.images.length > 0 ? req.order.items[req.itemIndex].product.images[0] : '',
        price: req.order.items[req.itemIndex].unitprice,
        qty: req.order.items[req.itemIndex].qty,
        shippingtype: req.order.items[req.itemIndex].shipping.ref.name,
        shippingtrack: req.order.items[req.itemIndex].refid ? req.order.items[req.itemIndex].refid : '',
        shippingprice: req.order.items[req.itemIndex].shipping.price
      },
      amount: req.order.items[req.itemIndex].amount,
      paymenttype: req.order.payment.paymenttype,
      shipping: {
        name: req.order.shippingAddress.name,
        tel: req.order.shippingAddress.tel,
        address: req.order.shippingAddress.address.address,
        subdistrict: req.order.shippingAddress.address.subdistrict,
        district: req.order.shippingAddress.address.district,
        province: req.order.shippingAddress.address.province,
        postcode: req.order.shippingAddress.address.postcode
      },
      confirmdate: confirmdate,
      sentdate: sentdate,
      receiveddate: receiveddate,
      canceldate: canceldate,
      transferdate: transferdate,
      refunddate: refunddate,
      isrefund: req.order.items[req.itemIndex].status === 'rejectrefund' || req.order.items[req.itemIndex].status === 'cancelrefund' ? true : false,
      status: req.order.items[req.itemIndex].status,
      rejectreason: req.order.items[req.itemIndex].remark ? req.order.items[req.itemIndex].remark : '',
      channel: req.order.channel,
      user: req.order.user
    };
  } else {
    req.order.itemsbid[req.itemIndex].log.forEach(function (l) {
      if (l.status.toString() === 'confirm') {
        confirmdate = l.created;
      } else if (l.status.toString() === 'sent') {
        sentdate = l.created;
      } else if (l.status.toString() === 'completed') {
        receiveddate = l.created;
      } else if (l.status.toString() === 'cancel' || l.status.toString() === 'reject' || l.status.toString() === 'admincancel') {
        canceldate = l.created;
      } else if (l.status.toString() === 'transferred') {
        transferdate = l.created;
      } else if (l.status.toString() === 'rejectrefund' || l.status.toString() === 'cancelrefund' || l.status.toString() === 'admincancelrefund') {
        refunddate = l.created;
      } else if (l.status.toString() === 'topay') {
        topaydate = l.created;
      }
    });
    resData = {
      itemid: req.itm_id,
      orderid: req.order._id,
      docno: req.order.docno ? req.order.docno : req.order._id,
      product: {
        _id: req.order.itemsbid[req.itemIndex].bid._id,
        name: req.order.itemsbid[req.itemIndex].bid.name,
        image: req.order.itemsbid[req.itemIndex].bid.image && req.order.itemsbid[req.itemIndex].bid.image.length > 0 ? req.order.itemsbid[req.itemIndex].bid.image[0] : '',
        price: req.order.itemsbid[req.itemIndex].unitprice,
        qty: req.order.itemsbid[req.itemIndex].qty,
        shippingtype: req.order.itemsbid[req.itemIndex].shipping.ref.name,
        shippingtrack: req.order.itemsbid[req.itemIndex].refid ? req.order.itemsbid[req.itemIndex].refid : '',
        shippingprice: req.order.itemsbid[req.itemIndex].shipping.price
      },
      amount: req.order.itemsbid[req.itemIndex].amount,
      paymenttype: req.order.payment.paymenttype,
      shipping: {
        name: req.order.shippingAddress.name,
        tel: req.order.shippingAddress.tel,
        address: req.order.shippingAddress.address.address,
        subdistrict: req.order.shippingAddress.address.subdistrict,
        district: req.order.shippingAddress.address.district,
        province: req.order.shippingAddress.address.province,
        postcode: req.order.shippingAddress.address.postcode
      },
      topaydate: topaydate,
      confirmdate: confirmdate,
      sentdate: sentdate,
      receiveddate: receiveddate,
      canceldate: canceldate,
      transferdate: transferdate,
      refunddate: refunddate,
      isrefund: req.order.itemsbid[req.itemIndex].status === 'rejectrefund' || req.order.itemsbid[req.itemIndex].status === 'cancelrefund' ? true : false,
      status: req.order.itemsbid[req.itemIndex].status,
      rejectreason: req.order.itemsbid[req.itemIndex].remark ? req.order.itemsbid[req.itemIndex].remark : '',
      channel: req.order.channel,
      user: req.order.user
    };
  }



  req.resData = resData;
  next();
};

exports.orderDetail = function (req, res) {
  res.jsonp(req.resData);
};

exports.getOrderId = function (req, res, next) {
  Order.findById(req.body.orderid).exec(function (err, order) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.order = order;
      next();
    }
  });
};

exports.cancel = function (req, res, next) {
  var order = req.order;
  // console.log(order);
  if (order.channel === 'bid') {
    if (order.itemsbid && order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status === 'admincancel') {
      return res.status(400).send({
        message: 'this item cancel by admin!'
      });
    } else {
      order.itemsbid[order.itemsbid.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].status = 'cancel';
      order.itemsbid[order.itemsbid.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].log.push({
        status: 'cancel',
        created: new Date()
      });
    }
  } else if (order.channel === 'order') {
    if (order.items && order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status === 'confirm') {
      order.items[order.items.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].status = 'cancel';
      order.items[order.items.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].log.push({
        status: 'cancel',
        created: new Date()
      });
    } else {
      if (order.items[order.items.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].status === 'reject') {
        return res.status(400).send({
          message: 'this item reject by shop!'
        });
      } else {
        return res.status(400).send({
          message: 'can not cancel item!'
        });
      }
    }
  }

  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.notidata = order;
      next();
      // res.jsonp(order);
    }
  });

};

exports.confirm = function (req, res, next) {
  var order = req.order;
  // console.log(order);
  if (order.channel === 'bid') {
    if (order.itemsbid && order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status === 'admincancel') {
      return res.status(400).send({
        message: 'this item cancel by admin!'
      });
    } else {
      order.itemsbid[order.itemsbid.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].status = 'confirm';
      order.itemsbid[order.itemsbid.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].log.push({
        status: 'confirm',
        created: new Date()
      });
    }
  } else if (order.channel === 'order') {
    return res.status(400).send({
      message: 'channel is order can not change status!'
    });
  }

  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.notidata = order;
      next();
      // res.jsonp(order);
    }
  });

};

exports.complete = function (req, res, next) {
  var order = req.order;
  if (order.channel === 'bid') {
    order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status = 'completed';
    order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].log.push({
      status: 'completed',
      created: new Date()
    });
  } else {
    order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status = 'completed';
    order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].log.push({
      status: 'completed',
      created: new Date()
    });
  }

  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.notidata = order;
      next();
    }
  });

};

exports.sent = function (req, res, next) {
  var order = req.order;
  if (order.channel === 'bid') {
    if (order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status === 'admincancel') {
      return res.status(400).send({
        message: 'this item cancel by admin!'
      });
    } else {
      order.itemsbid[order.itemsbid.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].status = 'sent';
      order.itemsbid[order.itemsbid.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].refid = req.body.refid;
      order.itemsbid[order.itemsbid.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].log.push({
        status: 'sent',
        created: new Date()
      });
    }
  } else {
    if (order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status === 'confirm') {
      order.items[order.items.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].status = 'sent';
      order.items[order.items.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].refid = req.body.refid;
      order.items[order.items.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].log.push({
        status: 'sent',
        created: new Date()
      });
    } else {
      if (order.items[order.items.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].status === 'cancel') {
        return res.status(400).send({
          message: 'this item cancel by user!'
        });
      } else {
        return res.status(400).send({
          message: 'can not sent item!'
        });
      }
    }
  }

  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.notidata = order;
      next();
    }
  });

};

exports.reject = function (req, res, next) {
  var order = req.order;
  if (order.items[order.items.map(function (e) {
    return e._id.toString();
  }).indexOf(req.body.itemid.toString())].status === 'confirm') {
    order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status = 'reject';
    order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].remark = req.body.remark;
    order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].log.push({
      status: 'reject',
      created: new Date()
    });
  } else {
    if (order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status === 'cancel') {
      return res.status(400).send({
        message: 'this item cancel by user!'
      });
    } else {
      return res.status(400).send({
        message: 'can not reject item!'
      });
    }
  }
  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.notidata = order;
      next();
    }
  });

};

exports.transfer = function (req, res, next) {
  var order = req.order;
  order.items[order.items.map(function (e) {
    return e._id.toString();
  }).indexOf(req.body.itemid.toString())].status = 'transferred';
  order.items[order.items.map(function (e) {
    return e._id.toString();
  }).indexOf(req.body.itemid.toString())].log.push({
    status: 'transferred',
    created: new Date()
  });

  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.notidata = order;
      next();
    }
  });

};

exports.refund = function (req, res, next) {
  var order = req.order;
  if (order.channel === 'bid') {
    order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status = order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status + 'refund';
    order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].log.push({
      status: order.itemsbid[order.itemsbid.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].status,
      created: new Date()
    });
  } else {
    order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status = order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status + 'refund';
    order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].log.push({
      status: order.items[order.items.map(function (e) {
        return e._id.toString();
      }).indexOf(req.body.itemid.toString())].status,
      created: new Date()
    });
  }


  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.notidata = order;
      next();
    }
  });

};

exports.admincancel = function (req, res, next) {
  var order = req.order;
  if (order.channel === 'bid') {
    order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status = 'admincancel';
    order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].remark = req.body.remark;
    order.itemsbid[order.itemsbid.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].log.push({
      status: 'admincancel',
      created: new Date()
    });
  } else {
    order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].status = 'admincancel';
    order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].remark = req.body.remark;
    order.items[order.items.map(function (e) {
      return e._id.toString();
    }).indexOf(req.body.itemid.toString())].log.push({
      status: 'admincancel',
      created: new Date()
    });
  }


  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.notidata = order;
      next();
    }
  });
};

exports.getOrderListAdmin = function (req, res, next) {
  var firstIndex = 0;
  var lastIndex = 10;
  var statusTH = ['รอชำระเงิน', 'รอจัดส่ง', 'รอรับสินค้า', 'สำเร็จ', 'ลูกค้ายกเลิก', 'ระบบยกเลิก', 'คืนเงินแล้ว', 'จ่ายเงินแล้ว'];
  var statusEN = ['topay', 'confirm', 'sent', 'completed', 'cancel', 'admincancel', 'refund', 'transferred'];
  var status = 'topay';
  if (req.body.currentpage > 1) {
    firstIndex = ((req.body.currentpage - 1) * 10);
    lastIndex = (req.body.currentpage * 10);
  }
  var filter = {};
  if (req.body.title && req.body.title !== '') {
    status = statusEN[statusTH.indexOf(req.body.title)];
  }
  // console.log(status);
  if (req.body.keyword && req.body.keyword !== '') {
    filter = searchName(req.body.keyword);
  }
  Order.find(filter).sort('-created').populate('items.product').populate('itemsbid.bid').populate('user', 'firstName displayName').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var dataOrders = [];
      if (orders && orders.length > 0) {
        orders.forEach(function (order) {
          var sentdate2 = '';
          var completed2 = '';
          var canceldate = '';
          var isrefund = false;
          var remark = '';
          if (order.channel === 'bid') {
            order.itemsbid.forEach(function (itm) {
              if (itm.status === 'rejectrefund' || itm.status === 'cancelrefund' || itm.status === 'admincancelrefund') {
                isrefund = true;
              }
              if (itm.status === 'reject' || itm.status === 'admincancel') {
                remark = itm.remark;
              }
              if (itm.log && itm.log.length > 0) {
                itm.log.forEach(function (it) {
                  if (it.status === 'sent') {
                    sentdate2 = it.created;
                  } else if (it.status === 'completed') {
                    completed2 = it.created;
                  } else if (it.status === 'transferred') {
                    completed2 = it.created;
                  } else if (it.status === 'cancel' || it.status === 'reject') {
                    canceldate = it.created;
                  }
                });
              }
              if (status.toString() === 'refund' ? itm.status.toString() === 'cancelrefund' || itm.status.toString() === 'rejectrefund' || itm.status.toString() === 'admincancelrefund' : status.toString() === 'admincancel' ? itm.status.toString() === 'admincancel' || itm.status.toString() === 'reject' : itm.status.toString() === status.toString()) {
                dataOrders.push({
                  itemid: itm._id,
                  orderid: order._id,
                  docno: order.docno ? order.docno : order._id,
                  name: itm.bid && itm.bid.name ? itm.bid.name : '',
                  image: itm.bid && itm.bid.image ? itm.bid.image[0] : '',
                  price: itm.unitprice,
                  qty: itm.qty,
                  shippingtype: itm.shipping.ref.name,
                  shippingprice: itm.shipping.price,
                  amount: itm.amount,
                  sentdate: sentdate2,
                  receivedate: completed2,
                  canceldate: canceldate,
                  isrefund: isrefund,
                  status: itm.status,
                  rejectreason: remark,
                  refid: itm.refid ? itm.refid : '',
                  channel: order.channel,
                  user: order.user
                });
              }
            });
          } else {
            order.items.forEach(function (itm) {

              if (itm.status === 'rejectrefund' || itm.status === 'cancelrefund' || itm.status === 'admincancelrefund') {
                isrefund = true;
              }
              if (itm.status === 'reject' || itm.status === 'admincancel') {
                remark = itm.remark;
              }
              if (itm.log && itm.log.length > 0) {
                itm.log.forEach(function (it) {
                  if (it.status === 'sent') {
                    sentdate2 = it.created;
                  } else if (it.status === 'completed') {
                    completed2 = it.created;
                  } else if (it.status === 'transferred') {
                    completed2 = it.created;
                  } else if (it.status === 'cancel' || it.status === 'reject') {
                    canceldate = it.created;
                  }
                });
              }
              if (status.toString() === 'refund' ? itm.status.toString() === 'cancelrefund' || itm.status.toString() === 'rejectrefund' || itm.status.toString() === 'admincancelrefund' : status.toString() === 'admincancel' ? itm.status.toString() === 'admincancel' || itm.status.toString() === 'reject' : itm.status.toString() === status.toString()) {
                dataOrders.push({
                  itemid: itm._id,
                  orderid: order._id,
                  docno: order.docno ? order.docno : order._id,
                  name: itm.product && itm.product.name ? itm.product.name : '',
                  image: itm.product && itm.product.images ? itm.product.images[0] : '',
                  price: itm.unitprice,
                  qty: itm.qty,
                  shippingtype: itm.shipping.ref.name,
                  shippingprice: itm.shipping.price,
                  amount: itm.amount,
                  sentdate: sentdate2,
                  receivedate: completed2,
                  canceldate: canceldate,
                  isrefund: isrefund,
                  status: itm.status,
                  rejectreason: remark,
                  refid: itm.refid ? itm.refid : '',
                  channel: order.channel,
                  user: order.user
                });
              }
            });
          }

        });
      }
      req.pagins = countPage(dataOrders);
      req.orders = dataOrders.slice(firstIndex, lastIndex);
      next();
    }
  });
};

exports.cookingOrderListAdmin = function (req, res, next) {
  var data = {
    titles: ['รอชำระเงิน', 'รอจัดส่ง', 'รอรับสินค้า', 'สำเร็จ', 'ลูกค้ายกเลิก', 'ระบบยกเลิก', 'คืนเงินแล้ว', 'จ่ายเงินแล้ว'],
    items: req.orders,
    paging: req.pagins
  };
  req.data = data;
  next();
};

exports.resOrderListAdmin = function (req, res) {
  res.jsonp(req.data);
};

exports.getBidId = function (req, res, next) {
  Bid.findById(req.body.bidid).exec(function (err, bid) {
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

exports.updateBidId = function (req, res, next) {
  var bid = req.bid;
  // console.log(bid);
  if (bid.userbid && bid.userbid.length > 0) {
    bid.status = 'topay';
    bid.docno = req.notidata.docno;
  } else {
    bid.status = 'end';
  }
  bid.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.bid = bid;
      next();
    }
  });
};

exports.bidCreate = function (req, res, next) {
  if (req.bid.userbid && req.bid.userbid.length === 0) {
    res.jsonp('no user bid');
  } else {
    var userbid;
    req.bid.userbid.forEach(function (ubid) {
      if (req.bid.price === ubid.bidprice) {
        userbid = ubid.user;
      }
    });
    // console.log(req.bid);
    var bidOrder = {
      docno: +new Date(),
      channel: 'bid',
      itemsbid: [{
        bid: req.bid,
        unitprice: req.bid.price,
        qty: 1,
        amount: req.bid.price,
        log: [{
          status: 'topay',
          created: new Date()
        }]
      }],
      qty: 1,
      amount: req.bid.price,
      shippingamount: 0,
      discountamount: 0,
      totalamount: req.bid.price,
      created: new Date(),
      user: userbid
    };
    var order = new Order(bidOrder);
    order.save(function (err) {
      if (err) {
        console.log(err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.notidata = order;
        next();
        // res.jsonp(order);
      }
    });
  }

};

function countPage(orders) {
  var numpage = [];
  if (orders && orders.length > 0) {
    var pages = orders.length / 10;
    var pagings = Math.ceil(pages);
    for (var i = 0; i < pagings; i++) {
      numpage.push(i + 1);
    }

  }
  return numpage;
}

function searchName(keyWordName) {
  var keywordname = {
    $or: [{
      'docno': {
        '$regex': keyWordName,
        '$options': 'i'
      }
    }],

  };
  return keywordname;
}

// {
//   "shippingAddress":
//   {
//     "name": "สรายุทธ กังสรานุวัตถ์",
//       "tel": "0876789896",
//         "address": {
//       "address": "81/69",
//         "district": "ลำลูกกา",
//           "subdistrict": "บึงคำพร้อย",
//             "province": "ปทุมธานี",
//               "postcode": "12150"
//     }
//   },
//   "coupon": { },
//   "payment": {
//     "paymenttype": "Credit card",
//       "creditno": "4242424242424242",
//         "creditname": "test",
//           "expdate": "12/18",
//             "creditcvc": "111"
//   },
//   "itemsbid": [
//     {
//       "bid": {
//         "_id": "5a8a9cc8a8a54f13009abeb4",
//         "user": "5a703fec56d7af13004452d0",
//         "startprice": 20,
//         "bidprice": 5,
//         "detail":
//           "ใส่นุ่มสบาย",
//         "starttime": "2018-02-21T16:00:00.000Z",
//         "endtime": "2018-02-21T16:47:00.000Z",
//         "__v": 5,
//         "price": 40,
//         "created": "2018-02-19T09:45:44.868Z",
//         "shippings": [{ "ref": { "_id": "5a792088bcd047130096a89c", "user": "5a703fec56d7af13004452d0", "detail": "ส่งสินค้าภายใน 3 วัน", "__v": 0, "created": "2018-02-06T03:27:04.649Z", "name": "ส่ง EMS" }, "price": 90, "_id": "5a8d42ff8ebf791300f6b3aa" }],
//         "status": "topay",
//         "userbid": [{ "user": "5a729893ed0e55130097bdc2", "bidprice": 25, "_id": "5a8befb3ffe48b13000d42ff", "created": "2018-02-20T09:51:47.781Z" }, { "user": "5a7d6d16d716851300b943f8", "bidprice": 30, "_id": "5a8befc4ffe48b13000d4300", "created": "2018-02-20T09:52:04.489Z" }, { "user": "5a729893ed0e55130097bdc2", "bidprice": 35, "_id": "5a8d3f1c8ebf791300f6b39c", "created": "2018-02-21T09:42:52.926Z" }, { "user": "5a729893ed0e55130097bdc2", "bidprice": 40, "_id": "5a8d3ffc8ebf791300f6b39d", "created": "2018-02-21T09:46:36.036Z" }], "image": ["http://res.cloudinary.com/huq7thcvh/image/upload/v1519033544/nqq1iaukyjlhueoyaghl.jpg"], "name": "เสื้อวินเทจชายทะเล"
//       }, "unitprice": 40, "qty": 1, "amount": 40, "_id": "5a8d40148ebf791300f6b39f", "log": [{ "status": "topay", "_id": "5a8d40148ebf791300f6b3a0", "created": "2018-02-21T09:47:00.098Z" }], "status": "topay", "shipping": { "ref": { "_id": "5a792088bcd047130096a89c", "user": "5a703fec56d7af13004452d0", "detail": "ส่งสินค้าภายใน 3 วัน", "__v": 0, "created": "2018-02-06T03:27:04.649Z", "name": "ส่ง EMS" }, "price": 90, "_id": "5a8d42ff8ebf791300f6b3aa" }
//     }],
//     "omiseToken": "tokn_test_5b1pr9jhlq3ia2e7nhl",
//       "amount": 40,
//         "shippingamount": 90,
//           "discountamount": 0,
//             "totalamount": 130
// }