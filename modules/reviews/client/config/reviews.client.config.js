(function () {
  'use strict';

  angular
    .module('reviews')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Reviews',
      state: 'reviews',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'reviews', {
      title: 'List Reviews',
      state: 'reviews.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'reviews', {
      title: 'Create Review',
      state: 'reviews.create',
      roles: ['user']
    });
  }
}());
