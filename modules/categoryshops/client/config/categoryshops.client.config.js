(function () {
  'use strict';

  angular
    .module('categoryshops')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Categoryshops',
      state: 'categoryshops',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'categoryshops', {
      title: 'List Categoryshops',
      state: 'categoryshops.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'categoryshops', {
      title: 'Create Categoryshop',
      state: 'categoryshops.create',
      roles: ['user']
    });
  }
}());
