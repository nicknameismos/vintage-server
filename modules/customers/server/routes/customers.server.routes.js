'use strict';

/**
 * Module dependencies
 */
var customersPolicy = require('../policies/customers.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  customers = require('../controllers/customers.server.controller');

module.exports = function (app) {

  //get home customer
  app.route('/api/customer/home/:lat/:lng')
    .get(customers.ads,
    customers.hotprices,
    customers.hotpricesItm1,
    customers.hotpricesItm2,
    customers.categories,
    customers.listShop,
    customers.nearbyshops,
    customers.popshops,
    customers.favoriteshops,
    customers.returnShop);

  app.route('/api/customer/categoryshop/:cateid/:lat/:lng')
    .get(customers.listShop,
    customers.nearbyshops,
    customers.popshops,
    customers.favoriteshops,
    customers.returnShopByCate);

  app.route('/api/customer/shops/:condition/:lat/:lng')
    .get(customers.nearbyshops,
    customers.popshops,
    customers.favoriteshops);

  app.route('/api/customer/todaywelcome')
    .get(customers.gettodaybyuser, customers.getbenefitlogin, customers.todaywelcome);

  app.param('lat', customers.getlat);
  app.param('lng', customers.getlng);
  app.param('cateid', customers.getcateid);
  app.param('condition', customers.getcondition);

  app.route('/api/vintagecustomerhome')
    .get(customers.getListBids, customers.cookingListBids, customers.getListAds, customers.cookingListAds, customers.getListProducts, customers.cookingListProducts, customers.customerVintageHome);

  app.param('lat', customers.getlat);
  app.param('lng', customers.getlng);
  app.param('cateid', customers.getcateid);
  app.param('condition', customers.getcondition);

};
