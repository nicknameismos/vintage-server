// Ads service used to communicate Ads REST endpoints
(function () {
  'use strict';

  angular
    .module('ads')
    .factory('AdsService', AdsService);

  AdsService.$inject = ['$resource'];

  function AdsService($resource) {
    return $resource('api/ads/:adId', {
      adId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
