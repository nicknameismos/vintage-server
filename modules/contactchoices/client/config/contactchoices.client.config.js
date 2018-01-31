(function () {
  'use strict';

  angular
    .module('contactchoices')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Contactchoices',
      state: 'contactchoices',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'contactchoices', {
      title: 'List Contactchoices',
      state: 'contactchoices.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'contactchoices', {
      title: 'Create Contactchoice',
      state: 'contactchoices.create',
      roles: ['user']
    });
  }
}());
