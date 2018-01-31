(function () {
  'use strict';

  angular
    .module('bids')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Bids',
      state: 'bids',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'bids', {
      title: 'List Bids',
      state: 'bids.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'bids', {
      title: 'Create Bid',
      state: 'bids.create',
      roles: ['user']
    });
  }
}());
