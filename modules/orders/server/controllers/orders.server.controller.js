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

exports.create = function (req, res, next) {
  var order = new Order(req.body);
  var _order = req.body;
  order.omiseresponse = order.payment.paymenttype === 'Credit Card' ? req.omiseresponse : order.omiseresponse;
  order.user = req.user;
  order.docno = +new Date();
  order.items.forEach((element, i) => {
    element.product = _order.items[i].product._id;
    element.shopid = _order.items[i].product.shopid;
    element.unitprice = _order.items[i].product.price;
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

  Order.findById(id).populate('user', 'displayName').populate('items.product').exec(function (err, order) {
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

exports.customerGetListOrder = function (req, res, next) {
  Order.find({ user: { _id: req.user._id } }).sort('-created').populate('user', 'displayName').populate('items.product').exec(function (err, orders) {
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
      if (itm.status === 'confirm') {
        resData[0].items.push({
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
          refid: itm.refid ? itm.refid : ''
        });
      } else if (itm.status === 'sent') {
        var sentdate = '';
        if (itm.log && itm.log.length > 0) {
          itm.log.forEach(function (it) {
            if (it.status === 'sent') {
              sentdate = it.created;
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
          shippingtype: itm.shipping.ref.name ? itm.shipping.ref.name : '',
          shippingprice: itm.shipping.price,
          amount: itm.amount,
          sentdate: sentdate,
          receivedate: '',
          canceldate: '',
          isrefund: false,
          status: 'sent',
          rejectreason: '',
          refid: itm.refid ? itm.refid : ''
        });
      } else if (itm.status === 'completed' || itm.status === 'transferred') {
        var sentdate2 = '';
        var completed2 = '';
        if (itm.log && itm.log.length > 0) {
          itm.log.forEach(function (it) {
            if (it.status === 'sent') {
              sentdate2 = it.created;
            } else if (it.status === 'completed') {
              completed2 = it.created;
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
          sentdate: sentdate2,
          receivedate: completed2,
          canceldate: '',
          isrefund: false,
          status: itm.status,
          rejectreason: '',
          refid: itm.refid ? itm.refid : ''
        });
      } else if (itm.status === 'cancel' || itm.status === 'admincancel' || itm.status === 'reject' || itm.status === 'rejectrefund' || itm.status === 'cancelrefund' || itm.status === 'admincancelrefund') {
        var canceldate = '';
        var remark = '';
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
          sentdate: '',
          receivedate: '',
          canceldate: canceldate,
          isrefund: false,
          status: itm.status,
          rejectreason: remark,
          refid: itm.refid ? itm.refid : ''
        });
      }
    });
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
  Order.find({ items: { $elemMatch: { shopid: req.shopid } } }).sort('-created').populate('user', 'displayName').populate('items.product').exec(function (err, orders) {
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
};

exports.cookingOrderDetail = function (req, res, next) {
  var confirmdate = '';
  var sentdate = '';
  var receiveddate = '';
  var canceldate = '';
  var transferdate = '';
  var refunddate = '';

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

  var resData = {
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
    rejectreason: req.order.items[req.itemIndex].remark ? req.order.items[req.itemIndex].remark : ''
  };
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
  if (order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status === 'confirm') {
    order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status = 'cancel';
    order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].log.push({
      status: 'cancel',
      created: new Date()
    });
  } else {
    if (order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status === 'reject') {
      return res.status(400).send({
        message: 'this item reject by shop!'
      });
    } else {
      return res.status(400).send({
        message: 'can not cancel item!'
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
      // res.jsonp(order);
    }
  });

};

exports.complete = function (req, res, next) {
  var order = req.order;
  order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status = 'completed';
  order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].log.push({
    status: 'completed',
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

exports.sent = function (req, res, next) {
  var order = req.order;
  if (order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status === 'confirm') {
    order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status = 'sent';
    order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].refid = req.body.refid;
    order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].log.push({
      status: 'sent',
      created: new Date()
    });
  } else {
    if (order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status === 'cancel') {
      return res.status(400).send({
        message: 'this item cancel by user!'
      });
    } else {
      return res.status(400).send({
        message: 'can not sent item!'
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

exports.reject = function (req, res, next) {
  var order = req.order;
  if (order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status === 'confirm') {
    order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status = 'reject';
    order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].remark = req.body.remark;
    order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].log.push({
      status: 'reject',
      created: new Date()
    });
  } else {
    if (order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status === 'cancel') {
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
  order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status = 'transferred';
  order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].log.push({
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
  order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status = order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status + 'refund';
  order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].log.push({
    status: order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status,
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

exports.admincancel = function (req, res, next) {
  var order = req.order;
  order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].status = 'admincancel';
  order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].remark = req.body.remark;
  order.items[order.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())].log.push({
    status: 'admincancel',
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
  Order.find(filter).sort('-created').populate('items.product').populate('user', 'firstName').exec(function (err, orders) {
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
                refid: itm.refid ? itm.refid : ''
              });
            }
          });
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