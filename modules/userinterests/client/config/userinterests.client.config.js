(function () {
  'use strict';

  angular
    .module('userinterests')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Userinterests',
      state: 'userinterests',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'userinterests', {
      title: 'List Userinterests',
      state: 'userinterests.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'userinterests', {
      title: 'Create Userinterest',
      state: 'userinterests.create',
      roles: ['user']
    });
  }
}());
