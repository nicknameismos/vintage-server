'use strict';
var jwt = require('express-jwt');
var mongoose = require('mongoose'),
  pushNotification = mongoose.model('Notification'),
  Product = mongoose.model('Product'),
  Shop = mongoose.model('Shop'),
  User = mongoose.model('User'),
  path = require('path'),
  request = require('request'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  pushNotiUrl = process.env.PUSH_NOTI_URL || 'https://onesignal.com/api/v1/notifications',
  User = mongoose.model('User');

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
  res.render('modules/core/server/views/index', {
    user: req.user || null
  });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      });
    },
    'default': function () {
      res.send('Path not found');
    }
  });
};

exports.jwtCheck = jwt({
  secret: 'ngEurope rocks!',
  credentialsRequired: false
});

/**
 * Test jwt Decoder
 * Expect req.user
 */
exports.protected = function (req, res) {
  res.json(req.user);
};

exports.createNotification = function (req, res) {
  var notiLogs = [];
  Product.populate(req.notidata, {
    path: 'items.product'
  }, function (err, orderRes2) {
    Shop.populate(orderRes2, {
      path: 'items.product.shop'
    }, function (err, orderRes3) {
      User.populate(orderRes3, {
        path: 'items.product.shop.user'
      }, function (err, orderRes4) {
        orderRes4.items.forEach(itm => {
          var title = 'คุณมีรายการสั่งซื้อใหม่';
          var detail = itm.product.name + ' จำนวน ' + itm.qty + ' ชิ้น';
          notiLogs.push({
            title: title,
            detail: detail,
            userowner: itm.product.shop.user,
            user: req.user
          });
          // console.log(notiLogs);
          var shopIds = itm.product && itm.product.shop && itm.product.shop.user && itm.product.shop.user.notificationids ? itm.product.shop.user.notificationids : [];
          shopNoti(title, detail, shopIds);
        });
        var title2 = 'ขอบคุณที่ใช้บริการ';
        var detail2 = 'หมายเลขการสั่งซื้อ ' + orderRes4._id;
        notiLogs.push({
          title: title2,
          detail: detail2,
          userowner: req.user,
          user: req.user
        });
        var userIds = req.user && req.user.notificationids ? req.user.notificationids : [];
        userNoti(title2, detail2, userIds);
        pushNotification.create(notiLogs, function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.jsonp(orderRes4);
        });
      });
    });
  });
};

exports.updateNotification = function (req, res) {
  var notiLog = {};
  Product.populate(req.notidata, {
    path: 'items.product'
  }, function (err, orderRes2) {
    Shop.populate(orderRes2, {
      path: 'items.product.shop'
    }, function (err, orderRes3) {
      User.populate(orderRes3, {
        path: 'items.product.shop.user'
      }, function (err, orderRes4) {
        var item = orderRes4.items[orderRes4.items.map(function (e) { return e._id.toString(); }).indexOf(req.body.itemid.toString())];
        var userIds = [];
        var title = '';
        var detail = '';
        var isShop = false;
        if (item.status === 'cancel') {
          title = 'สินค้าถูกยกเลิก';
          detail = 'สินค้า ' + item.product.name + ' หมายเลขการสั่งซื้อ ' + orderRes4._id;
          isShop = true;
        } else if (item.status === 'complete') {
          title = 'รายการสินค้าสำเร็จ';
          detail = 'สินค้า ' + item.product.name + ' หมายเลขการสั่งซื้อ ' + orderRes4._id + ' สำเร็จแล้ว';
          isShop = true;
        } else if (item.status === 'sent') {
          title = 'สินค้าดำเนินการจัดส่ง';
          detail = 'สินค้า ' + item.product.name + ' หมายเลขการสั่งซื้อ ' + orderRes4._id + ' กำลังดำเนินการจัดส่ง';
        } else if (item.status === 'reject') {
          title = 'สินค้าดำเนินการจัดส่ง';
          detail = 'สินค้า ' + item.product.name + ' หมายเลขการสั่งซื้อ ' + orderRes4._id + ' กำลังดำเนินการจัดส่ง';
        } else if (item.status === 'transferred') {
          title = 'ระบบชำระเงิน';
          detail = 'สินค้า ' + item.product.name + ' หมายเลขการสั่งซื้อ ' + orderRes4._id + ' ชำระเงินจากระบบ';
          isShop = true;
        } else if (item.status === 'rejectrefund' || item.status === 'cancelrefund') {
          title = 'ระบบชำระเงินคืน';
          detail = 'สินค้า ' + item.product.name + ' หมายเลขการสั่งซื้อ ' + orderRes4._id + ' ชำระเงินคืนจากระบบ';
        }
        if (isShop) {
          notiLog = {
            title: title,
            detail: detail,
            userowner: item.product.shop.user,
            user: req.user
          };
          userIds = item.product && item.product.shop && item.product.shop.user && item.product.shop.user.notificationids ? item.product.shop.user.notificationids : [];
          shopNoti(title, detail, userIds);
        } else {
          notiLog = {
            title: title,
            detail: detail,
            userowner: orderRes4.user,
            user: req.user
          };
          userIds = req.user && req.user.notificationids ? req.user.notificationids : [];
          userNoti(title, detail, userIds);
        }
        // var userIds = req.user && req.user.notificationids ? req.user.notificationids : [];
        var pushnoti = new pushNotification(notiLog);
        pushnoti.save(function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.jsonp(orderRes4);
        });
      });
    });
  });
};

function userNoti(title, message, ids) {
  request({
    url: pushNotiUrl,
    headers: {
      'Authorization': 'Basic ZWNkZWY0MmUtNGJiNC00ZThjLWIyOWUtNzdmNzAxZmMyZDMw'
    },
    method: 'POST',
    json: {
      app_id: 'd5d9533c-3ac8-42e6-bc16-a5984bef02ff',
      headings: {
        en: title
      },
      contents: {
        en: message
      },
      include_player_ids: ids // ['4c7cecbc-d0c7-48a9-a415-2986acc0bec3']
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error);

    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    // console.log({
    //   message: 'sent noti success'
    // });

  });
}

function shopNoti(title, message, ids) {
  request({
    url: pushNotiUrl,
    headers: {
      'Authorization': 'Basic ZWFkMjNkNDUtZDIyNy00MGU2LTg5ZjEtYmZlY2FkYjUxZDY2'
    },
    method: 'POST',
    json: {
      app_id: 'fdfae3dc-e634-47f4-b959-f04e60f4613b',
      headings: {
        en: title
      },
      contents: {
        en: message
      },
      include_player_ids: ids // ['4c7cecbc-d0c7-48a9-a415-2986acc0bec3']
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error);

    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    // console.log({
    //   message: 'sent noti success'
    // });

  });
}