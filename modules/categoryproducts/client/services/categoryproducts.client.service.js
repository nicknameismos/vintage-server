// Categoryproducts service used to communicate Categoryproducts REST endpoints
(function () {
  'use strict';

  angular
    .module('categoryproducts')
    .factory('CategoryproductsService', CategoryproductsService);

  CategoryproductsService.$inject = ['$resource'];

  function CategoryproductsService($resource) {
    return $resource('api/categoryproducts/:categoryproductId', {
      categoryproductId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
