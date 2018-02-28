'use strict';
var jwt = require('express-jwt');
var mongoose = require('mongoose'),
  pushNotification = mongoose.model('Notification'),
  Product = mongoose.model('Product'),
  Shop = mongoose.model('Shop'),
  Bid = mongoose.model('Bid'),
  User = mongoose.model('User'),
  path = require('path'),
  request = require('request'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  pushNotiUrl = process.env.PUSH_NOTI_URL || 'https://onesignal.com/api/v1/notifications',
  User = mongoose.model('User'),
  item;

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
        path: 'items.product.shop.shopowner'
      }, function (err, orderRes4) {
        orderRes4.items.forEach(function (itm) {
          var title = 'คุณมีรายการสั่งซื้อใหม่';
          var detail = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + itm.product.name + ' จำนวน ' + itm.qty + ' ชิ้น กรุณาเตรียมสินค้าเพื่อดำเนินการจัดส่ง';
          notiLogs.push({
            title: title,
            detail: detail,
            userowner: itm.product.shop.shopowner,
            user: req.user
          });
          // console.log(notiLogs);
          var shopIds = itm.product && itm.product.shop && itm.product.shop.shopowner && itm.product.shop.shopowner.notificationids ? itm.product.shop.shopowner.notificationids : [];
          shopNoti(title, detail, shopIds);
        });
        var title2 = 'สั่งซื้อสินค้าสำเร็จ';
        var detail2 = 'ยืนยันคำสั่งซื้อ ' + orderRes4.docno + ' สำเร็จ เราได้แจ้งผู้ขายให้เตรียมการจัดส่งสินค้าแล้ว';
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
  var notifications = [];
  var notiLog = {};
  var userIds = [];
  var titleShop = '';
  var detailShop = '';
  var titleUser = '';
  var detailUser = '';
  var isShop = false;
  var dateStatus = '';
  var title = '';
  var detail = '';
  if (req.notidata.channel === 'order') {
    Product.populate(req.notidata, {
      path: 'items.product'
    }, function (err, orderRes2) {
      Shop.populate(orderRes2, {
        path: 'items.product.shop'
      }, function (err, orderRes3) {
        User.populate(orderRes3, {
          path: 'items.product.shop.shopowner'
        }, function (err, orderRes4) {
          User.populate(orderRes4, {
            path: 'user'
          }, function (err, orderRes5) {
            var item = orderRes4.items[orderRes4.items.map(function (e) {
              return e._id.toString();
            }).indexOf(req.body.itemid.toString())];

            var orderid = orderRes4.docno ? orderRes4.docno : orderRes4._id;

            item = item;
            item.orderid = orderid;

            if (item.status === 'cancel') {

              // var dateStatus = '';
              item.log.forEach(function (log) {
                if (log.status === 'cancel') {
                  var date = new Date(log.created);
                  dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
                }
              });

              titleShop = 'รายการสั่งซื้อถูกยกเลิก';
              detailShop = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ถูกผู้ซื้อยกเลิก เมื่อ ' + dateStatus + '';
              notiLog = {
                title: titleShop,
                detail: detailShop,
                userowner: item.product.shop.shopowner,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = item.product && item.product.shop && item.product.shop.shopowner && item.product.shop.shopowner.notificationids ? item.product.shop.shopowner.notificationids : [];
              shopNoti(titleShop, detailShop, userIds);

              titleUser = 'รายการสั่งซื้อถูกยกเลิก';
              detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ถูกยกเลิกเรียบร้อยแล้ว เมื่อ ' + dateStatus + ' กรุณารอการคืนเงินจากระบบ';

              notiLog = {
                title: titleUser,
                detail: detailUser,
                userowner: orderRes4.user,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
              userNoti(titleUser, detailUser, userIds);

            } else if (item.status === 'completed') {

              // var dateStatus = '';
              // item.log.forEach(function (log) {
              //   if (log.status === 'completed') {
              //     var date = new Date(log.created);
              //     dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + date.getMinutes();
              //   }
              // });

              titleShop = 'รายการสั่งซื้อสำเร็จ';
              detailShop = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ลูกค้าได้รับสินค้าเรียบร้อยแล้ว กรุณารอการชำระเงินจากตลาด';
              notiLog = {
                title: titleShop,
                detail: detailShop,
                userowner: item.product.shop.shopowner,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = item.product && item.product.shop && item.product.shop.shopowner && item.product.shop.shopowner.notificationids ? item.product.shop.shopowner.notificationids : [];
              shopNoti(titleShop, detailShop, userIds);

              titleUser = 'รายการสั่งซื้อสำเร็จ';
              detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ทำรายการเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ';

              notiLog = {
                title: titleUser,
                detail: detailUser,
                userowner: orderRes4.user,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
              userNoti(titleUser, detailUser, userIds);

            } else if (item.status === 'sent') {

              item.log.forEach(function (log) {
                if (log.status === 'sent') {
                  var date = new Date(log.created);
                  dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
                }
              });

              titleUser = 'สินค้าถูกจัดส่งแล้ว';
              detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + 'ชิ้น ถูกจัดส่งแล้ว เมื่อ ' + dateStatus + ' เลขพัสดุของคุณคือ ' + item.refid + ' กรุณารอรับสินค้า หากได้รับสินค้าแล้วกรุณากด "ได้รับสินค้าแล้ว"';

              notiLog = {
                title: titleUser,
                detail: detailUser,
                userowner: orderRes4.user,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
              userNoti(titleUser, detailUser, userIds);

            } else if (item.status === 'reject') {

              // var dateStatus = '';
              item.log.forEach(function (log) {
                if (log.status === 'reject') {
                  var date = new Date(log.created);
                  dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
                }
              });

              titleShop = 'รายการสั่งซื้อถูกยกเลิก';
              detailShop = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ถูกยกเลิกเรียบร้อยแล้ว เมื่อ ' + dateStatus + '';
              notiLog = {
                title: titleShop,
                detail: detailShop,
                userowner: item.product.shop.shopowner,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = item.product && item.product.shop && item.product.shop.shopowner && item.product.shop.shopowner.notificationids ? item.product.shop.shopowner.notificationids : [];
              shopNoti(titleShop, detailShop, userIds);

              titleUser = 'รายการสั่งซื้อถูกยกเลิก';
              detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ถูกยกเลิกจากร้านค้า เนื่องจาก' + item.remark + ' เมื่อ ' + dateStatus + ' กรุณารอการคืนเงินจากระบบ';

              notiLog = {
                title: titleUser,
                detail: detailUser,
                userowner: orderRes4.user,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
              userNoti(titleUser, detailUser, userIds);

            } else if (item.status === 'admincancel') {

              // var dateStatus = '';
              item.log.forEach(function (log) {
                if (log.status === 'admincancel') {
                  var date = new Date(log.created);
                  dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
                }
              });

              titleShop = 'รายการสั่งซื้อถูกยกเลิก';
              detailShop = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ถูกยกเลิกจากผู้ดูแลระบบ เนื่องจาก' + item.remark + ' เมื่อ ' + dateStatus;
              notiLog = {
                title: titleShop,
                detail: detailShop,
                userowner: item.product.shop.shopowner,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = item.product && item.product.shop && item.product.shop.shopowner && item.product.shop.shopowner.notificationids ? item.product.shop.shopowner.notificationids : [];
              shopNoti(titleShop, detailShop, userIds);

              titleUser = 'รายการสั่งซื้อถูกยกเลิก';
              detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ถูกยกเลิกจากผู้ดูแลระบบ เนื่องจาก' + item.remark + ' เมื่อ ' + dateStatus + ' กรุณารอการคืนเงินจากระบบ';

              notiLog = {
                title: titleUser,
                detail: detailUser,
                userowner: orderRes4.user,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
              userNoti(titleUser, detailUser, userIds);

            } else if (item.status === 'transferred') {

              // var dateStatus = '';
              item.log.forEach(function (log) {
                if (log.status === 'transferred') {
                  var date = new Date(log.created);
                  dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
                }
              });

              titleShop = 'ได้รับการชำระเงินจากตลาด';
              detailShop = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ได้รับการชำระเงินจากตลาด จำนวน ' + item.amount + ' บาท เมื่อ ' + dateStatus;
              notiLog = {
                title: titleShop,
                detail: detailShop,
                userowner: item.product.shop.shopowner,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = item.product && item.product.shop && item.product.shop.shopowner && item.product.shop.shopowner.notificationids ? item.product.shop.shopowner.notificationids : [];
              shopNoti(titleShop, detailShop, userIds);

            } else if (item.status === 'rejectrefund' || item.status === 'cancelrefund' || item.status === 'admincancelrefund') {

              // var dateStatus = '';
              item.log.forEach(function (log) {
                if (log.status === item.status) {
                  var date = new Date(log.created);
                  dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
                }
              });

              titleShop = 'ได้รับการคืนเงินจากระบบ';
              detailShop = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ได้รับการคืนเงินจากระบบ จำนวน ' + item.amount + ' บาท เมื่อ ' + dateStatus;
              notiLog = {
                title: titleShop,
                detail: detailShop,
                userowner: item.product.shop.shopowner,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = item.product && item.product.shop && item.product.shop.shopowner && item.product.shop.shopowner.notificationids ? item.product.shop.shopowner.notificationids : [];
              shopNoti(titleShop, detailShop, userIds);

              titleUser = 'ได้รับการคืนเงินจากระบบ';
              detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.product.name + ' จำนวน ' + item.qty + ' ชิ้น ได้รับการคืนเงินจากระบบ จำนวน ' + item.amount + ' บาท เมื่อ ' + dateStatus;

              notiLog = {
                title: titleUser,
                detail: detailUser,
                userowner: orderRes4.user,
                user: req.user
              };
              notifications.push(notiLog);
              userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
              userNoti(titleUser, detailUser, userIds);

            }
            // var userIds = req.user && req.user.notificationids ? req.user.notificationids : [];
            pushNotification.create(notifications, function (err) {
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
    });
  } else {
    Bid.populate(req.notidata, {
      path: 'itemsbid.bid'
    }, function (err, orderRes2) {
      User.populate(orderRes2, {
        path: 'user'
      }, function (err, orderRes4) {
        var item = orderRes4.itemsbid[orderRes4.itemsbid.map(function (e) {
          return e._id.toString();
        }).indexOf(req.body.itemid.toString())];
        var userIds = [];
        // var detail = '';
        var orderid = orderRes4.docno ? orderRes4.docno : orderRes4._id;

        item = item;
        item.orderid = orderid;

        if (item.status === 'cancel') {

          // var dateStatus = '';
          item.log.forEach(function (log) {
            if (log.status === 'cancel') {
              var date = new Date(log.created);
              dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
            }
          });

          titleUser = 'รายการสั่งซื้อถูกยกเลิก';
          detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.bid.name + ' จำนวน ' + item.qty + ' ชิ้น ถูกยกเลิกเรียบร้อยแล้ว เมื่อ ' + dateStatus + ' กรุณารอการคืนเงินจากระบบ';

          notiLog = {
            title: titleUser,
            detail: detailUser,
            userowner: orderRes4.user,
            user: req.user
          };
          notifications.push(notiLog);
          userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
          userNoti(titleUser, detailUser, userIds);

        } else if (item.status === 'completed') {

          // var dateStatus = '';
          // item.log.forEach(function (log) {
          //   if (log.status === 'completed') {
          //     var date = new Date(log.created);
          //     dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + date.getMinutes();
          //   }
          // });

          titleUser = 'รายการสั่งซื้อสำเร็จ';
          detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.bid.name + ' จำนวน ' + item.qty + ' ชิ้น ทำรายการเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ';

          notiLog = {
            title: titleUser,
            detail: detailUser,
            userowner: orderRes4.user,
            user: req.user
          };
          notifications.push(notiLog);
          userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
          userNoti(titleUser, detailUser, userIds);

        } else if (item.status === 'sent') {

          item.log.forEach(function (log) {
            if (log.status === 'sent') {
              var date = new Date(log.created);
              dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
            }
          });

          titleUser = 'สินค้าถูกจัดส่งแล้ว';
          detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.bid.name + ' จำนวน ' + item.qty + 'ชิ้น ถูกจัดส่งแล้ว เมื่อ ' + dateStatus + ' เลขพัสดุของคุณคือ ' + item.refid + ' กรุณารอรับสินค้า หากได้รับสินค้าแล้วกรุณากด "ได้รับสินค้าแล้ว"';

          notiLog = {
            title: titleUser,
            detail: detailUser,
            userowner: orderRes4.user,
            user: req.user
          };
          notifications.push(notiLog);
          userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
          userNoti(titleUser, detailUser, userIds);

        } else if (item.status === 'reject') {

          // var dateStatus = '';
          item.log.forEach(function (log) {
            if (log.status === 'reject') {
              var date = new Date(log.created);
              dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
            }
          });

          titleUser = 'รายการสั่งซื้อถูกยกเลิก';
          detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.bid.name + ' จำนวน ' + item.qty + ' ชิ้น ถูกยกเลิกจากร้านค้า เนื่องจาก' + item.remark + ' เมื่อ ' + dateStatus + ' กรุณารอการคืนเงินจากระบบ';

          notiLog = {
            title: titleUser,
            detail: detailUser,
            userowner: orderRes4.user,
            user: req.user
          };
          notifications.push(notiLog);
          userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
          userNoti(titleUser, detailUser, userIds);

        } else if (item.status === 'admincancel') {

          // var dateStatus = '';
          item.log.forEach(function (log) {
            if (log.status === 'admincancel') {
              var date = new Date(log.created);
              dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
            }
          });

          titleUser = 'รายการสั่งซื้อถูกยกเลิก';
          detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.bid.name + ' จำนวน ' + item.qty + ' ชิ้น ถูกยกเลิกจากผู้ดูแลระบบ เนื่องจาก' + item.remark + ' เมื่อ ' + dateStatus + ' กรุณารอการคืนเงินจากระบบ';

          notiLog = {
            title: titleUser,
            detail: detailUser,
            userowner: orderRes4.user,
            user: req.user
          };
          notifications.push(notiLog);
          userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
          userNoti(titleUser, detailUser, userIds);

        } else if (item.status === 'transferred') {


        } else if (item.status === 'rejectrefund' || item.status === 'cancelrefund' || item.status === 'admincancelrefund') {

          // var dateStatus = '';
          item.log.forEach(function (log) {
            if (log.status === item.status) {
              var date = new Date(log.created);
              dateStatus = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + (date.getHours() + 7) + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes());
            }
          });

          titleUser = 'ได้รับการคืนเงินจากระบบ';
          detailUser = 'รายการสั่งซื้อ ' + orderRes4.docno + ' สินค้า' + item.bid.name + ' จำนวน ' + item.qty + ' ชิ้น ได้รับการคืนเงินจากระบบ จำนวน ' + item.amount + ' บาท เมื่อ ' + dateStatus;

          notiLog = {
            title: titleUser,
            detail: detailUser,
            userowner: orderRes4.user,
            user: req.user
          };
          notifications.push(notiLog);
          userIds = orderRes4.user && orderRes4.user.notificationids ? orderRes4.user.notificationids : [];
          userNoti(titleUser, detailUser, userIds);

        }
        // var userIds = req.user && req.user.notificationids ? req.user.notificationids : [];
        pushNotification.create(notifications, function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          res.jsonp(orderRes4);
        });
      });
    });
  }
};

exports.createBidNotification = function (req, res) {
  var title = 'คุณชนะการประมูล';
  var detail = 'การประมูล ' + req.bid.name + ' สำเร็จ คุณชนะการประมูล สามารถชำระเงินได้ที่ "รายการสั่งซื้อของฉัน"';
  User.populate(req.notidata, {
    path: 'user'
  }, function (err, orderRes) {
    var notiLog = {
      title: title,
      detail: detail,
      userowner: orderRes.user,
      user: orderRes.user
    };
    var userIds = orderRes.user && orderRes.user.notificationids ? orderRes.user.notificationids : [];
    userNoti(title, detail, userIds);
    // var userIds = req.user && req.user.notificationids ? req.user.notificationids : [];
    var pushnoti = new pushNotification(notiLog);
    pushnoti.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.jsonp(orderRes);
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
      include_player_ids: ids,
      data: {
        type: 'Order',
        item: item
      }
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
      include_player_ids: ids,
      data: {
        type: 'Order',
        item: item
      }
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
