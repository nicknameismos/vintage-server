// Categoryshops service used to communicate Categoryshops REST endpoints
(function () {
  'use strict';

  angular
    .module('categoryshops')
    .factory('CategoryshopsService', CategoryshopsService);

  CategoryshopsService.$inject = ['$resource'];

  function CategoryshopsService($resource) {
    return $resource('api/categoryshops/:categoryshopId', {
      categoryshopId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
