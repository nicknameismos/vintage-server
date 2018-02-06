// Shippingmasters service used to communicate Shippingmasters REST endpoints
(function () {
  'use strict';

  angular
    .module('shippingmasters')
    .factory('ShippingmastersService', ShippingmastersService);

  ShippingmastersService.$inject = ['$resource'];

  function ShippingmastersService($resource) {
    return $resource('api/shippingmasters/:shippingmasterId', {
      shippingmasterId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
