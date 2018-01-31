(function () {
  'use strict';

  angular
    .module('promotioninterests')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Promotioninterests',
      state: 'promotioninterests',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'promotioninterests', {
      title: 'List Promotioninterests',
      state: 'promotioninterests.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'promotioninterests', {
      title: 'Create Promotioninterest',
      state: 'promotioninterests.create',
      roles: ['user']
    });
  }
}());
