(function () {
  'use strict';

  angular
    .module('campaigns')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Campaigns',
      state: 'campaigns',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'campaigns', {
      title: 'List Campaigns',
      state: 'campaigns.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'campaigns', {
      title: 'Create Campaign',
      state: 'campaigns.create',
      roles: ['user']
    });
  }
}());
