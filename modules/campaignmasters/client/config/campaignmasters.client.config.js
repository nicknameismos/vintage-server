(function () {
  'use strict';

  angular
    .module('campaignmasters')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Campaignmasters',
      state: 'campaignmasters',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'campaignmasters', {
      title: 'List Campaignmasters',
      state: 'campaignmasters.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'campaignmasters', {
      title: 'Create Campaignmaster',
      state: 'campaignmasters.create',
      roles: ['user']
    });
  }
}());
