'use strict';

/**
 * Module dependencies
 */
var shopsPolicy = require('../policies/shops.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  shops = require('../controllers/shops.server.controller');

module.exports = function (app) {
  // Shops Routes
  app.route('/api/shops').all(core.jwtCheck, shopsPolicy.isAllowed)
    .get(shops.list);

  app.route('/api/shops/categories').all(core.jwtCheck, shopsPolicy.isAllowed)
    .get(shops.getShop, shops.cookingAll, shops.cookingNew, shops.cookingOfficial, shops.cookingConsignment, shops.listFilter);

  app.route('/api/shops').all(core.jwtCheck, shopsPolicy.isAllowed)
    .post(shops.create);

  app.route('/api/shops/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .get(shops.read);

  app.route('/api/shops/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.update)
    .delete(shops.delete);

  app.route('/api/shops/createusershop/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.createUserByShop, shops.updateUserShop, shops.mailer);

  //get home shops
  app.route('/api/shopshome').all(core.jwtCheck, shopsPolicy.isAllowed)
    .get(shops.cookingHomeShop, shops.resHomeShop);


  //get home admin
  app.route('/api/adminhome').all(core.jwtCheck, shopsPolicy.isAllowed)
    .get(shops.cookingAdminHome, shops.countPaging, shops.listHome);

  // /:currentpage/:keyword
  app.route('/api/filtershop').all(core.jwtCheck, shopsPolicy.isAllowed)
    .post(shops.sortName, shops.sortDate, shops.sortOfficial, shops.sortUnofficial, shops.filterPage);

  // /:currentpage/:keyword
  app.route('/api/changecover/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.changeCover, shops.resShopData);

  app.route('/api/addpromote/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.addPromote, shops.resShopData);

  app.route('/api/removepromote/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.removePromote);

  app.route('/api/createcate/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.createCate, shops.defaultProduct, shops.addCateToShop, shops.resShopData);

  app.route('/api/createproduct/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.createProduct, shops.addProductToShop, shops.resShopData);

  app.route('/api/manageshop/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.editShop);

  app.route('/api/manageshopinfo').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.updateUser, shops.findShopUser, shops.updateShop, shops.shopInfo);

  app.route('/api/getshopsname').all(core.jwtCheck, shopsPolicy.isAllowed)
    .get(shops.getShopsName);

  app.route('/api/deleteproduct/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.defaultProduct, shops.deleteProductUpdateShop, shops.deleteProduct, shops.resShopData);

  app.route('/api/checkshopbyname').all(core.jwtCheck, shopsPolicy.isAllowed)
    .post(shops.checkShopByName, shops.listShopByName);

  app.route('/api/deletecateproduct/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.shopSliceItems, shops.cateProductByID, shops.findAllProduct, shops.deleteAllProduct, shops.deleteCateProduct, shops.resDeleteCate);

  app.route('/api/updateitems/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .put(shops.defaultProduct, shops.shopUpdateItems);

  app.route('/api/customershopdetail/:shopId').all(core.jwtCheck, shopsPolicy.isAllowed)
    .get(shops.cookingShopDetail, shops.getCateByShop, shops.getProductsByShop, shops.shopDetail);

  // /:search/:keyword
  app.route('/api/searchkeyword').all(core.jwtCheck, shopsPolicy.isAllowed)
    .post(shops.searchShopKeyword, shops.searchProductKeyword, shops.resSearch);

  // // Finish by binding the Shop middleware
  app.param('shopId', shops.shopByID);
};
