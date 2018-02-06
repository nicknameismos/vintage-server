(function () {
  'use strict';

  angular
    .module('shippingmasters')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Shippingmasters',
      state: 'shippingmasters',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'shippingmasters', {
      title: 'List Shippingmasters',
      state: 'shippingmasters.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'shippingmasters', {
      title: 'Create Shippingmaster',
      state: 'shippingmasters.create',
      roles: ['user']
    });
  }
}());
