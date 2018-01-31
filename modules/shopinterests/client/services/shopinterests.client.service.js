// Shopinterests service used to communicate Shopinterests REST endpoints
(function () {
  'use strict';

  angular
    .module('shopinterests')
    .factory('ShopinterestsService', ShopinterestsService);

  ShopinterestsService.$inject = ['$resource'];

  function ShopinterestsService($resource) {
    return $resource('api/shopinterests/:shopinterestId', {
      shopinterestId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
