// Coupons service used to communicate Coupons REST endpoints
(function () {
  'use strict';

  angular
    .module('coupons')
    .factory('CouponsService', CouponsService);

  CouponsService.$inject = ['$resource'];

  function CouponsService($resource) {
    return $resource('api/coupons/:couponId', {
      couponId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
