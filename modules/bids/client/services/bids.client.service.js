// Bids service used to communicate Bids REST endpoints
(function () {
  'use strict';

  angular
    .module('bids')
    .factory('BidsService', BidsService);

  BidsService.$inject = ['$resource'];

  function BidsService($resource) {
    return $resource('api/bids/:bidId', {
      bidId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
