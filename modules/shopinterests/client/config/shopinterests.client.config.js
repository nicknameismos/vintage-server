(function () {
  'use strict';

  angular
    .module('shopinterests')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Shopinterests',
      state: 'shopinterests',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'shopinterests', {
      title: 'List Shopinterests',
      state: 'shopinterests.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'shopinterests', {
      title: 'Create Shopinterest',
      state: 'shopinterests.create',
      roles: ['user']
    });
  }
}());
