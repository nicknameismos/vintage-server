(function () {
  'use strict';

  angular
    .module('currencies')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Currencies',
      state: 'currencies',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'currencies', {
      title: 'List Currencies',
      state: 'currencies.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'currencies', {
      title: 'Create Currency',
      state: 'currencies.create',
      roles: ['user']
    });
  }
}());
