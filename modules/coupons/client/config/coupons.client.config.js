(function () {
  'use strict';

  angular
    .module('coupons')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Coupons',
      state: 'coupons',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'coupons', {
      title: 'List Coupons',
      state: 'coupons.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'coupons', {
      title: 'Create Coupon',
      state: 'coupons.create',
      roles: ['user']
    });
  }
}());
