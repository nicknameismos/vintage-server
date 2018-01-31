(function () {
  'use strict';

  angular
    .module('categoryproducts')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Categoryproducts',
      state: 'categoryproducts',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'categoryproducts', {
      title: 'List Categoryproducts',
      state: 'categoryproducts.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'categoryproducts', {
      title: 'Create Categoryproduct',
      state: 'categoryproducts.create',
      roles: ['user']
    });
  }
}());
