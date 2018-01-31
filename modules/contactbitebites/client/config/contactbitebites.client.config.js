(function () {
  'use strict';

  angular
    .module('contactbitebites')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Contactbitebites',
      state: 'contactbitebites',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'contactbitebites', {
      title: 'List Contactbitebites',
      state: 'contactbitebites.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'contactbitebites', {
      title: 'Create Contactbitebite',
      state: 'contactbitebites.create',
      roles: ['user']
    });
  }
}());
